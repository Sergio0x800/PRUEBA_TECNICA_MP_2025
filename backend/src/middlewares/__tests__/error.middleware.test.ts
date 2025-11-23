import errorHandler from "../error.middleware";
import HttpError from "../../utils/httpError";

describe("error.middleware", () => {
	function createMockRes() {
		const res: any = {};
		res.status = jest.fn().mockImplementation((code: number) => {
			res.statusCode = code;
			return res;
		});
		res.json = jest.fn().mockImplementation((payload: any) => {
			res.payload = payload;
			return res;
		});
		res.headersSent = false;
		return res as any;
	}

	const mockReq: any = { method: "GET", originalUrl: "/api/test" };
	const mockNext = jest.fn();

	it("returns 500 and generic message for generic Error", () => {
		const res = createMockRes();
		const err = new Error("boom");

		errorHandler(err, mockReq, res, mockNext);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalled();
		expect(res.payload).toHaveProperty("success", false);
		expect(res.payload).toHaveProperty("message", "boom");
	});

	it("respects HttpError statusCode and includes details", () => {
		const res = createMockRes();
		const herr = new HttpError(418, "I'm a teapot", { reason: "testing" });

		errorHandler(herr, mockReq, res, mockNext);

		expect(res.status).toHaveBeenCalledWith(418);
		expect(res.json).toHaveBeenCalled();
		expect(res.payload).toMatchObject({
			success: false,
			message: "I'm a teapot",
			details: { reason: "testing" },
		});
	});
});
