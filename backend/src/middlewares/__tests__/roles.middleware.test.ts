import { permit, deny } from "../roles.middleware";

describe("roles.middleware", () => {
  let req: any;
  let res: any;
  let next: jest.Mock;

  beforeEach(() => {
    req = { user: undefined };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  it("permit should call next when user has allowed role (string array)", () => {
    req.user = { roles: ["Coordinador"] };
    const mw = permit("coordinador");
    mw(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("permit should return 401 when not authenticated", () => {
    req.user = undefined;
    const mw = permit("coordinador");
    mw(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "No autenticado" });
    expect(next).not.toHaveBeenCalled();
  });

  it("deny should block when user has denied role (object role format)", () => {
    req.user = { roles: [{ nombre: "Coordinador" }] };
    const mw = deny("coordinador");
    mw(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Acceso denegado" });
    expect(next).not.toHaveBeenCalled();
  });

  it("permit should accept roles provided as single string", () => {
    req.user = { roles: "tecnico" };
    const mw = permit("tecnico");
    mw(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("deny should block when roles array contains denied string", () => {
    req.user = { roles: ["tecnico"] };
    const mw = deny("tecnico");
    mw(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
