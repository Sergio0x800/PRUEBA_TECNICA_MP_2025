
IF NOT EXISTS (SELECT 1 FROM sys.sql_logins WHERE name = N'dicriuser')
BEGIN
    CREATE LOGIN [dicriuser] 
        WITH PASSWORD = N'DicriUserPass2025!Aa', CHECK_POLICY = OFF, CHECK_EXPIRATION = OFF;
END;
GO

IF DB_ID('DB_DICRI_MP') IS NULL
BEGIN
    CREATE DATABASE DB_DICRI_MP;
END;
GO

USE DB_DICRI_MP;
GO

IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'dicriuser')
BEGIN
    CREATE USER [dicriuser] FOR LOGIN [dicriuser];
    ALTER ROLE db_owner ADD MEMBER [dicriuser];
END;
GO




------------------------------------------------------------
-- TABLAS CATÁLOGO
------------------------------------------------------------

IF OBJECT_ID('dbo.TC_ROL', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.TC_ROL (
        id_rol               INT IDENTITY(1,1) PRIMARY KEY,
        nombre               VARCHAR(100) NOT NULL,
        descripcion          VARCHAR(255) NULL,
        id_usuario_registro  INT NULL,
        fecha_registro       DATETIME NOT NULL DEFAULT GETDATE(),
        estado_registro      TINYINT NOT NULL DEFAULT 1
    );
END;
GO

IF OBJECT_ID('dbo.TC_ESTADO_EXPEDIENTE', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.TC_ESTADO_EXPEDIENTE (
        id_estado_expediente INT IDENTITY(1,1) PRIMARY KEY,
        nombre               VARCHAR(100) NOT NULL,
        descripcion          VARCHAR(255) NULL,
        id_usuario_registro  INT NULL,
        fecha_registro       DATETIME NOT NULL DEFAULT GETDATE(),
        estado_registro      TINYINT NOT NULL DEFAULT 1
    );
END;
GO

IF OBJECT_ID('dbo.TC_DEPARTAMENTO', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.TC_DEPARTAMENTO (
        id_departamento      INT IDENTITY(1,1) PRIMARY KEY,
        nombre               VARCHAR(100) NOT NULL,
        id_usuario_registro  INT NULL,
        fecha_registro       DATETIME NOT NULL DEFAULT GETDATE(),
        estado_registro      TINYINT NOT NULL DEFAULT 1
    );
END;
GO

IF OBJECT_ID('dbo.TC_MUNICIPIO', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.TC_MUNICIPIO (
        id_municipio         INT IDENTITY(1,1) PRIMARY KEY,
        id_departamento      INT NOT NULL,
        nombre               VARCHAR(100) NOT NULL,
        id_usuario_registro  INT NULL,
        fecha_registro       DATETIME NOT NULL DEFAULT GETDATE(),
        estado_registro      TINYINT NOT NULL DEFAULT 1
    );
END;
GO

-- Catalog: tipos de indicio
IF OBJECT_ID('dbo.TC_TIPO_INDICIO', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.TC_TIPO_INDICIO (
        id_tipo_indicio      INT IDENTITY(1,1) PRIMARY KEY,
        nombre               VARCHAR(100) NOT NULL,
        descripcion          VARCHAR(255) NULL,
        id_usuario_registro  INT NULL,
        fecha_registro       DATETIME NOT NULL DEFAULT GETDATE(),
        estado_registro      TINYINT NOT NULL DEFAULT 1
    );
END;
GO

-- FK MUNICIPIO → DEPARTAMENTO
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_MUNICIPIO_DEPARTAMENTO')
BEGIN
    ALTER TABLE dbo.TC_MUNICIPIO
    ADD CONSTRAINT FK_MUNICIPIO_DEPARTAMENTO
    FOREIGN KEY (id_departamento) REFERENCES dbo.TC_DEPARTAMENTO(id_departamento);
END;
GO


------------------------------------------------------------
-- TABLAS TRANSACCIONALES
------------------------------------------------------------

IF OBJECT_ID('dbo.TT_USUARIO', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.TT_USUARIO (
        id_usuario               INT IDENTITY(1,1) PRIMARY KEY,
        usuario                  VARCHAR(80) NOT NULL UNIQUE,
        clave_hash               VARBINARY(32) NOT NULL,
        nombres                  VARCHAR(100) NOT NULL,
        apellidos                VARCHAR(100) NOT NULL,
        correo                   VARCHAR(150) NOT NULL,
        telefono                 VARCHAR(20) NULL,
        numero_empleado          VARCHAR(20) NOT NULL UNIQUE,
        ultimo_acceso            DATETIME NULL,
        id_usuario_registro      INT NOT NULL,
        fecha_registro           DATETIME NOT NULL DEFAULT GETDATE(),
        id_usuario_actualizacion INT NULL,
        fecha_actualizacion      DATETIME NULL,
        estado_registro          TINYINT NOT NULL DEFAULT 1
    );
END;
GO


IF OBJECT_ID('dbo.TT_USUARIO_ROL', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.TT_USUARIO_ROL (
        id_usuario_rol      INT IDENTITY(1,1) PRIMARY KEY,
        id_usuario          INT NOT NULL,
        id_rol              INT NOT NULL,
        id_usuario_registro INT NOT NULL,
        fecha_registro      DATETIME NOT NULL DEFAULT GETDATE(),
        estado_registro     TINYINT NOT NULL DEFAULT 1
    );
END;
GO

-- FKs
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_USUROL_USER')
BEGIN
    ALTER TABLE dbo.TT_USUARIO_ROL
    ADD CONSTRAINT FK_USUROL_USER
    FOREIGN KEY (id_usuario) REFERENCES dbo.TT_USUARIO(id_usuario);
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_USUROL_ROL')
BEGIN
    ALTER TABLE dbo.TT_USUARIO_ROL
    ADD CONSTRAINT FK_USUROL_ROL
    FOREIGN KEY (id_rol) REFERENCES dbo.TC_ROL(id_rol);
END;
GO


IF OBJECT_ID('dbo.TT_EXPEDIENTE', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.TT_EXPEDIENTE (
        id_expediente       INT IDENTITY(1,1) PRIMARY KEY,
        codigo_expediente   VARCHAR(50) NOT NULL,
        descripcion         VARCHAR(500) NULL,
        id_departamento     INT NOT NULL,
        id_municipio        INT NOT NULL,
        fecha_hecho         DATETIME NULL,
        id_usuario_registro INT NOT NULL,
        fecha_registro      DATETIME NOT NULL DEFAULT GETDATE(),
        id_usuario_actualizacion INT NULL,
        fecha_actualizacion DATETIME NULL,
        estado_registro     TINYINT NOT NULL DEFAULT 1
    );

    CREATE UNIQUE INDEX UX_EXPEDIENTE_CODIGO
    ON dbo.TT_EXPEDIENTE(codigo_expediente);
END;
GO

-- Add column to store the last estado id on the expediente if it does not exist
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE [object_id] = OBJECT_ID('dbo.TT_EXPEDIENTE')
      AND name = 'id_ultimo_estado_expediente'
)
BEGIN
    ALTER TABLE dbo.TT_EXPEDIENTE
    ADD id_ultimo_estado_expediente INT NULL;
END;
GO

-- FKs
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_EXPEDIENTE_DEPT')
BEGIN
    ALTER TABLE dbo.TT_EXPEDIENTE
    ADD CONSTRAINT FK_EXPEDIENTE_DEPT
    FOREIGN KEY (id_departamento) REFERENCES dbo.TC_DEPARTAMENTO(id_departamento);
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_EXPEDIENTE_MUNI')
BEGIN
    ALTER TABLE dbo.TT_EXPEDIENTE
    ADD CONSTRAINT FK_EXPEDIENTE_MUNI
    FOREIGN KEY (id_municipio) REFERENCES dbo.TC_MUNICIPIO(id_municipio);
END;
GO


IF OBJECT_ID('dbo.TT_EXPEDIENTE_ESTADO', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.TT_EXPEDIENTE_ESTADO (
        id_expediente_estado INT IDENTITY(1,1) PRIMARY KEY,
        id_expediente        INT NOT NULL,
        id_estado_expediente INT NOT NULL,
        id_coordinador_revision INT NOT NULL,
        motivo_rechazo       VARCHAR(500) NULL,
        id_usuario_registro  INT NOT NULL,
        fecha_registro       DATETIME NOT NULL DEFAULT GETDATE(),
        estado_registro      TINYINT NOT NULL DEFAULT 1
    );
END;
GO

-- FKs
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_EXPEST_EXP')
BEGIN
    ALTER TABLE dbo.TT_EXPEDIENTE_ESTADO
    ADD CONSTRAINT FK_EXPEST_EXP
    FOREIGN KEY (id_expediente) REFERENCES dbo.TT_EXPEDIENTE(id_expediente);
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_EXPEST_EST')
BEGIN
    ALTER TABLE dbo.TT_EXPEDIENTE_ESTADO
    ADD CONSTRAINT FK_EXPEST_EST
    FOREIGN KEY (id_estado_expediente) REFERENCES dbo.TC_ESTADO_EXPEDIENTE(id_estado_expediente);
END;
GO


IF OBJECT_ID('dbo.TT_INDICIO', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.TT_INDICIO (
        id_indicio          INT IDENTITY(1,1) PRIMARY KEY,
        id_expediente       INT NOT NULL,
        numero_indicio      INT NOT NULL,
        descripcion         VARCHAR(500) NOT NULL,
        tipo                VARCHAR(100) NULL,
        color               VARCHAR(50) NULL,
        tamano              VARCHAR(50) NULL,
        peso                VARCHAR(50) NULL,
        ubicacion           VARCHAR(200) NULL,
        observacion         VARCHAR(200) NULL,
        id_usuario_registro INT NOT NULL,
        fecha_registro      DATETIME NOT NULL DEFAULT GETDATE(),
        id_usuario_actualizacion INT NULL,
        fecha_actualizacion DATETIME NULL,
        estado_registro     TINYINT NOT NULL DEFAULT 1
    );

    CREATE UNIQUE INDEX UX_INDICIO_CORRELATIVO
    ON dbo.TT_INDICIO(id_expediente, numero_indicio);
END;
GO

-- FK
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_IND_EXPE')
BEGIN
    ALTER TABLE dbo.TT_INDICIO
    ADD CONSTRAINT FK_IND_EXPE
    FOREIGN KEY (id_expediente) REFERENCES dbo.TT_EXPEDIENTE(id_expediente);
END;
GO

-- Add column id_tipo_indicio to TT_INDICIO (if not present) to reference TC_TIPO_INDICIO
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE [object_id] = OBJECT_ID('dbo.TT_INDICIO')
      AND name = 'id_tipo_indicio'
)
BEGIN
    ALTER TABLE dbo.TT_INDICIO
    ADD id_tipo_indicio INT NULL;
END;
GO

-- FK IND_TIPO -> TC_TIPO_INDICIO
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_IND_TIPO')
BEGIN
    ALTER TABLE dbo.TT_INDICIO
    ADD CONSTRAINT FK_IND_TIPO
    FOREIGN KEY (id_tipo_indicio) REFERENCES dbo.TC_TIPO_INDICIO(id_tipo_indicio);
END;
GO


------------------------------------------------------------
-- ÍNDICES EXTRA
------------------------------------------------------------

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_EXPEDIENTE_ESTADO_EXPE')
BEGIN
    CREATE INDEX IX_EXPEDIENTE_ESTADO_EXPE ON dbo.TT_EXPEDIENTE_ESTADO(id_expediente);
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_INDICIO_EXPE')
BEGIN
    CREATE INDEX IX_INDICIO_EXPE ON dbo.TT_INDICIO(id_expediente);
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_USUARIO_USERNAME')
BEGIN
    CREATE INDEX IX_USUARIO_USERNAME ON dbo.TT_USUARIO(usuario);
END;
GO


------------------------------------------------------------
-- INSERTS PREDETERMINADOS
------------------------------------------------------------

-- Roles
IF NOT EXISTS (SELECT 1 FROM dbo.TC_ROL WHERE nombre = 'ADMIN')
BEGIN
    INSERT INTO dbo.TC_ROL (nombre, descripcion, id_usuario_registro)
    VALUES ('ADMIN', 'Administrador del sistema', 1);
END;

IF NOT EXISTS (SELECT 1 FROM dbo.TC_ROL WHERE nombre = 'TECNICO')
BEGIN
    INSERT INTO dbo.TC_ROL (nombre, descripcion, id_usuario_registro)
    VALUES ('TECNICO', 'Técnico investigador', 1);
END;

IF NOT EXISTS (SELECT 1 FROM dbo.TC_ROL WHERE nombre = 'COORDINADOR')
BEGIN
    INSERT INTO dbo.TC_ROL (nombre, descripcion, id_usuario_registro)
    VALUES ('COORDINADOR', 'Coordinador de revisión', 1);
END;
GO

-- Estados
IF NOT EXISTS (SELECT 1 FROM dbo.TC_ESTADO_EXPEDIENTE WHERE nombre = 'Registrado')
BEGIN
    INSERT INTO dbo.TC_ESTADO_EXPEDIENTE (nombre, descripcion, id_usuario_registro)
    VALUES 
    ('Registrado', 'Expediente recién creado', 1),
    ('En revisión', 'En revisión por coordinador', 1),
    ('Rechazado', 'Correcciones requeridas', 1),
    ('Aprobado', 'Expediente aprobado', 1),
    ('Archivado', 'Cerrado y archivado', 1);
END;
GO

-- Departamento de ejemplo
IF NOT EXISTS (SELECT 1 FROM dbo.TC_DEPARTAMENTO WHERE nombre = 'Jutiapa')
BEGIN
    INSERT INTO dbo.TC_DEPARTAMENTO (nombre, id_usuario_registro)
    VALUES ('Jutiapa', 1);
END;
GO

-- Municipio de ejemplo
IF NOT EXISTS (SELECT 1 FROM dbo.TC_MUNICIPIO WHERE nombre = 'Jutiapa')
BEGIN
    INSERT INTO dbo.TC_MUNICIPIO (id_departamento, nombre, id_usuario_registro)
    VALUES (
        (SELECT id_departamento FROM dbo.TC_DEPARTAMENTO WHERE nombre = 'Jutiapa'),
        'Jutiapa',
        1
    );
END;
GO

-- Tipos de indicio predeterminados
IF NOT EXISTS (SELECT 1 FROM dbo.TC_TIPO_INDICIO WHERE nombre = 'Material')
BEGIN
    INSERT INTO dbo.TC_TIPO_INDICIO (nombre, descripcion, id_usuario_registro)
    VALUES
    ('Material', 'Objeto material relacionado', 1),
    ('Huella', 'Huella dactilar o similar', 1),
    ('Fotografía', 'Evidencia fotográfica', 1),
    ('Testimonio', 'Declaración o testimonio', 1);
END;
GO


/* Stored procedure to obtain all expedientes for coordinador listing */
IF OBJECT_ID('dbo.sp_obtener_todos_expedientes', 'P') IS NULL
BEGIN
    EXEC('CREATE PROCEDURE dbo.sp_obtener_todos_expedientes AS BEGIN SET NOCOUNT ON; SELECT -1 AS placeholder; END');
END
GO
CREATE OR ALTER PROCEDURE dbo.sp_obtener_todos_expedientes
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        e.id_expediente,
        e.codigo_expediente,
        e.descripcion,
        e.id_departamento,
        e.id_municipio,
        e.fecha_hecho,
        e.id_usuario_registro,
        e.fecha_registro,
        e.id_usuario_actualizacion,
        e.fecha_actualizacion,
        e.estado_registro,
        e.id_ultimo_estado_expediente,
        est.nombre AS ultimo_estado_nombre
    FROM dbo.TT_EXPEDIENTE e
    LEFT JOIN dbo.TC_ESTADO_EXPEDIENTE est ON est.id_estado_expediente = e.id_ultimo_estado_expediente
    WHERE e.estado_registro = 1
    ORDER BY e.fecha_registro DESC;
END
GO

/* Stored procedure to create an expediente. Idempotent using CREATE OR ALTER. */
IF OBJECT_ID('dbo.sp_crear_expediente', 'P') IS NULL
BEGIN
    EXEC('CREATE PROCEDURE dbo.sp_crear_expediente AS BEGIN SET NOCOUNT ON; SELECT -1 AS placeholder; END');
END
GO
CREATE OR ALTER PROCEDURE dbo.sp_crear_expediente
    @codigo_expediente VARCHAR(50),
    @descripcion VARCHAR(500) = NULL,
    @id_departamento INT,
    @id_municipio INT,
    @fecha_hecho DATETIME = NULL,
    @id_usuario_registro INT,
    @id_usuario_actualizacion INT = NULL,
    @estado_registro TINYINT = 1
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO dbo.TT_EXPEDIENTE (
        codigo_expediente,
        descripcion,
        id_departamento,
        id_municipio,
        fecha_hecho,
        id_usuario_registro,
        id_usuario_actualizacion,
        estado_registro
    )
    VALUES (
        @codigo_expediente,
        @descripcion,
        @id_departamento,
        @id_municipio,
        @fecha_hecho,
        @id_usuario_registro,
        @id_usuario_actualizacion,
        @estado_registro
    );
    DECLARE @NewId INT = SCOPE_IDENTITY();

    -- Insert initial estado 'Registrado' (id_estado_expediente = 1)
    INSERT INTO dbo.TT_EXPEDIENTE_ESTADO (
        id_expediente,
        id_estado_expediente,
        id_coordinador_revision,
        motivo_rechazo,
        id_usuario_registro
    )
    VALUES (
        @NewId,
        1,
        @id_usuario_registro,
        NULL,
        @id_usuario_registro
    );

    -- update expediente to set the last estado
    UPDATE dbo.TT_EXPEDIENTE
    SET id_ultimo_estado_expediente = 1
    WHERE id_expediente = @NewId;

    SELECT @NewId AS id_expediente;
    SELECT * FROM dbo.TT_EXPEDIENTE WHERE id_expediente = @NewId;
END;
GO

------------------------------------------------------------
-- USUARIO ADMIN POR DEFECTO
------------------------------------------------------------
IF NOT EXISTS (SELECT 1 FROM dbo.TT_USUARIO WHERE usuario = 'admin')
BEGIN
    DECLARE @pwd VARBINARY(32) = HASHBYTES('SHA2_256', '123456');

    INSERT INTO dbo.TT_USUARIO (usuario, clave_hash, nombres, apellidos, correo, numero_empleado, id_usuario_registro)
    VALUES ('admin', @pwd, 'Administrador', 'Sistema', 'admin@example.com', '0001', 1);
END;
GO

-- Rol ADMIN para admin
IF NOT EXISTS (
    SELECT 1 
    FROM dbo.TT_USUARIO_ROL ur
    JOIN dbo.TT_USUARIO u ON ur.id_usuario = u.id_usuario
    JOIN dbo.TC_ROL r ON ur.id_rol = r.id_rol
    WHERE u.usuario = 'admin' AND r.nombre = 'ADMIN'
)
BEGIN
    INSERT INTO dbo.TT_USUARIO_ROL (id_usuario, id_rol, id_usuario_registro)
    VALUES (
        (SELECT id_usuario FROM dbo.TT_USUARIO WHERE usuario = 'admin'),
        (SELECT id_rol FROM dbo.TC_ROL WHERE nombre = 'ADMIN'),
        1
    );
END;
GO

-- Usuario Coordinador por defecto
IF NOT EXISTS (SELECT 1 FROM dbo.TT_USUARIO WHERE usuario = 'dperez')
BEGIN
    DECLARE @pwd VARBINARY(32) = HASHBYTES('SHA2_256', '123456');

    INSERT INTO dbo.TT_USUARIO (usuario, clave_hash, nombres, apellidos, correo, numero_empleado, id_usuario_registro)
    VALUES ('dperez', @pwd, 'Danilo', 'Pérez', 'dperez@example.com', '0003', 1);
END;
GO

IF NOT EXISTS (
    SELECT 1 
    FROM dbo.TT_USUARIO_ROL ur
    JOIN dbo.TT_USUARIO u ON ur.id_usuario = u.id_usuario
    JOIN dbo.TC_ROL r ON ur.id_rol = r.id_rol
    WHERE u.usuario = 'dperez' AND r.nombre = 'COORDINADOR'
)
BEGIN
    INSERT INTO dbo.TT_USUARIO_ROL (id_usuario, id_rol, id_usuario_registro)
    VALUES (
        (SELECT id_usuario FROM dbo.TT_USUARIO WHERE usuario = 'dperez'),
        (SELECT id_rol FROM dbo.TC_ROL WHERE nombre = 'COORDINADOR'),
        1
    );
END;
GO

-- Usuario Técnico por defecto
IF NOT EXISTS (SELECT 1 FROM dbo.TT_USUARIO WHERE usuario = 'mgomez')
BEGIN
    DECLARE @pwd VARBINARY(32) = HASHBYTES('SHA2_256', '123456');

    INSERT INTO dbo.TT_USUARIO (usuario, clave_hash, nombres, apellidos, correo, numero_empleado, id_usuario_registro)
    VALUES ('mgomez', @pwd, 'Mario', 'Gomez', 'mario@example.com', '0002', 1);
END;
GO

IF NOT EXISTS (
    SELECT 1 
    FROM dbo.TT_USUARIO_ROL ur
    JOIN dbo.TT_USUARIO u ON ur.id_usuario = u.id_usuario
    JOIN dbo.TC_ROL r ON ur.id_rol = r.id_rol
    WHERE u.usuario = 'mgomez' AND r.nombre = 'TECNICO'
)
BEGIN
    INSERT INTO dbo.TT_USUARIO_ROL (id_usuario, id_rol, id_usuario_registro)
    VALUES (
        (SELECT id_usuario FROM dbo.TT_USUARIO WHERE usuario = 'mgomez'),
        (SELECT id_rol FROM dbo.TC_ROL WHERE nombre = 'TECNICO'),
        1
    );
END;
GO

/* Stored procedures for Expediente operations: obtener, actualizar, eliminar */
/* Stored procedures for Usuario (CRUD) */
IF OBJECT_ID('dbo.sp_crear_usuario', 'P') IS NULL
BEGIN
    EXEC('CREATE PROCEDURE dbo.sp_crear_usuario AS BEGIN SET NOCOUNT ON; SELECT -1 AS placeholder; END');
END
GO
CREATE OR ALTER PROCEDURE dbo.sp_crear_usuario
    @usuario VARCHAR(80),
    @clave VARCHAR(200),
    @nombres VARCHAR(100),
    @apellidos VARCHAR(100),
    @correo VARCHAR(150),
    @telefono VARCHAR(20) = NULL,
    @numero_empleado VARCHAR(20),
    @id_usuario_registro INT,
    @estado_registro TINYINT = 1
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @clave_hash VARBINARY(32) = HASHBYTES('SHA2_256', @clave);
    INSERT INTO dbo.TT_USUARIO (
        usuario, clave_hash, nombres, apellidos, correo, telefono, numero_empleado, id_usuario_registro, estado_registro
    ) VALUES (
        @usuario, @clave_hash, @nombres, @apellidos, @correo, @telefono, @numero_empleado, @id_usuario_registro, @estado_registro
    );
    DECLARE @NewId INT = SCOPE_IDENTITY();
    SELECT @NewId AS id_usuario;
    SELECT id_usuario, usuario, nombres, apellidos, correo, telefono, numero_empleado, ultimo_acceso, id_usuario_registro, fecha_registro, id_usuario_actualizacion, fecha_actualizacion, estado_registro
    FROM dbo.TT_USUARIO WHERE id_usuario = @NewId;
END;
GO

IF OBJECT_ID('dbo.sp_obtener_usuario', 'P') IS NULL
BEGIN
    EXEC('CREATE PROCEDURE dbo.sp_obtener_usuario AS BEGIN SET NOCOUNT ON; SELECT -1 AS placeholder; END');
END
GO
CREATE OR ALTER PROCEDURE dbo.sp_obtener_usuario
    @id INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        id_usuario,
        usuario,
        nombres,
        apellidos,
        correo,
        telefono,
        numero_empleado,
        ultimo_acceso,
        id_usuario_registro,
        fecha_registro,
        id_usuario_actualizacion,
        fecha_actualizacion,
        estado_registro
    FROM dbo.TT_USUARIO
    WHERE id_usuario = @id AND estado_registro = 1;
END;
GO

IF OBJECT_ID('dbo.sp_obtener_usuarios', 'P') IS NULL
BEGIN
    EXEC('CREATE PROCEDURE dbo.sp_obtener_usuarios AS BEGIN SET NOCOUNT ON; SELECT -1 AS placeholder; END');
END
GO
CREATE OR ALTER PROCEDURE dbo.sp_obtener_usuarios
AS
BEGIN
    SET NOCOUNT ON;
    SELECT id_usuario, usuario, nombres, apellidos, correo, telefono, numero_empleado, ultimo_acceso, id_usuario_registro, fecha_registro, id_usuario_actualizacion, fecha_actualizacion, estado_registro
    FROM dbo.TT_USUARIO
    WHERE estado_registro = 1
    ORDER BY nombres;
END;
GO

IF OBJECT_ID('dbo.sp_actualizar_usuario', 'P') IS NULL
BEGIN
    EXEC('CREATE PROCEDURE dbo.sp_actualizar_usuario AS BEGIN SET NOCOUNT ON; SELECT -1 AS placeholder; END');
END
GO
CREATE OR ALTER PROCEDURE dbo.sp_actualizar_usuario
    @id INT,
    @usuario VARCHAR(80) = NULL,
    @clave VARCHAR(200) = NULL,
    @nombres VARCHAR(100) = NULL,
    @apellidos VARCHAR(100) = NULL,
    @correo VARCHAR(150) = NULL,
    @telefono VARCHAR(20) = NULL,
    @numero_empleado VARCHAR(20) = NULL,
    @id_usuario_actualizacion INT = NULL,
    @estado_registro TINYINT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.TT_USUARIO
    SET
        usuario = COALESCE(@usuario, usuario),
        clave_hash = CASE WHEN @clave IS NOT NULL THEN HASHBYTES('SHA2_256', @clave) ELSE clave_hash END,
        nombres = COALESCE(@nombres, nombres),
        apellidos = COALESCE(@apellidos, apellidos),
        correo = COALESCE(@correo, correo),
        telefono = COALESCE(@telefono, telefono),
        numero_empleado = COALESCE(@numero_empleado, numero_empleado),
        id_usuario_actualizacion = COALESCE(@id_usuario_actualizacion, id_usuario_actualizacion),
        estado_registro = COALESCE(@estado_registro, estado_registro),
        fecha_actualizacion = GETDATE()
    WHERE id_usuario = @id;

    SELECT id_usuario, usuario, nombres, apellidos, correo, telefono, numero_empleado, ultimo_acceso, id_usuario_registro, fecha_registro, id_usuario_actualizacion, fecha_actualizacion, estado_registro
    FROM dbo.TT_USUARIO WHERE id_usuario = @id;
END;
GO

IF OBJECT_ID('dbo.sp_eliminar_usuario', 'P') IS NULL
BEGIN
    EXEC('CREATE PROCEDURE dbo.sp_eliminar_usuario AS BEGIN SET NOCOUNT ON; SELECT -1 AS placeholder; END');
END
GO
CREATE OR ALTER PROCEDURE dbo.sp_eliminar_usuario
    @id INT,
    @id_usuario_actualizacion INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.TT_USUARIO
    SET estado_registro = 0,
        fecha_actualizacion = GETDATE(),
        id_usuario_actualizacion = COALESCE(@id_usuario_actualizacion, id_usuario_actualizacion)
    WHERE id_usuario = @id;

    SELECT @@ROWCOUNT AS affected;
END;
GO

/* Stored procedures for authentication */
IF OBJECT_ID('dbo.sp_authenticate_usuario', 'P') IS NULL
BEGIN
    EXEC('CREATE PROCEDURE dbo.sp_authenticate_usuario AS BEGIN SET NOCOUNT ON; SELECT -1 AS placeholder; END');
END
GO
CREATE OR ALTER PROCEDURE dbo.sp_authenticate_usuario
    @usuario VARCHAR(80),
    @clave VARCHAR(200)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @hash VARBINARY(32) = HASHBYTES('SHA2_256', @clave);

    -- First select: user row
    SELECT
        id_usuario,
        usuario,
        nombres,
        apellidos,
        correo,
        telefono,
        numero_empleado,
        ultimo_acceso,
        id_usuario_registro,
        fecha_registro,
        id_usuario_actualizacion,
        fecha_actualizacion,
        estado_registro
    INTO #auth_user
    FROM dbo.TT_USUARIO
    WHERE usuario = @usuario
      AND clave_hash = @hash
      AND estado_registro = 1;

    -- If found, return the user row and then the roles as a second resultset
    IF EXISTS (SELECT 1 FROM #auth_user)
    BEGIN
        SELECT * FROM #auth_user;

        SELECT r.id_rol, r.nombre
        FROM dbo.TT_USUARIO_ROL ur
        JOIN dbo.TC_ROL r ON ur.id_rol = r.id_rol
        JOIN #auth_user u ON u.id_usuario = ur.id_usuario;
    END

    IF OBJECT_ID('tempdb..#auth_user') IS NOT NULL
        DROP TABLE #auth_user;
END;
GO

IF OBJECT_ID('dbo.sp_update_ultimo_acceso', 'P') IS NULL
BEGIN
    EXEC('CREATE PROCEDURE dbo.sp_update_ultimo_acceso AS BEGIN SET NOCOUNT ON; SELECT -1 AS placeholder; END');
END
GO
CREATE OR ALTER PROCEDURE dbo.sp_update_ultimo_acceso
    @id_usuario INT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.TT_USUARIO
    SET ultimo_acceso = GETDATE()
    WHERE id_usuario = @id_usuario;
    SELECT @@ROWCOUNT AS affected;
END;
GO
IF OBJECT_ID('dbo.sp_obtener_expediente', 'P') IS NULL
BEGIN
    EXEC('CREATE PROCEDURE dbo.sp_obtener_expediente AS BEGIN SET NOCOUNT ON; SELECT -1 AS placeholder; END');
END
GO
CREATE OR ALTER PROCEDURE dbo.sp_obtener_expediente
    @id INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        e.id_expediente,
        e.codigo_expediente,
        e.descripcion,
        e.id_departamento,
        e.id_municipio,
        e.fecha_hecho,
        e.id_usuario_registro,
        e.fecha_registro,
        e.id_usuario_actualizacion,
        e.fecha_actualizacion,
        e.estado_registro,
        e.id_ultimo_estado_expediente,
        est.nombre AS ultimo_estado_nombre
    FROM dbo.TT_EXPEDIENTE e
    LEFT JOIN dbo.TC_ESTADO_EXPEDIENTE est ON est.id_estado_expediente = e.id_ultimo_estado_expediente
    WHERE e.id_expediente = @id AND e.estado_registro = 1;
END;
GO

IF OBJECT_ID('dbo.sp_actualizar_expediente', 'P') IS NULL
BEGIN
    EXEC('CREATE PROCEDURE dbo.sp_actualizar_expediente AS BEGIN SET NOCOUNT ON; SELECT -1 AS placeholder; END');
END
GO
CREATE OR ALTER PROCEDURE dbo.sp_actualizar_expediente
    @id INT,
    @codigo_expediente VARCHAR(50) = NULL,
    @descripcion VARCHAR(500) = NULL,
    @id_departamento INT = NULL,
    @id_municipio INT = NULL,
    @fecha_hecho DATETIME = NULL,
    @id_usuario_actualizacion INT = NULL,
    @estado_registro TINYINT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.TT_EXPEDIENTE
    SET
        codigo_expediente = COALESCE(@codigo_expediente, codigo_expediente),
        descripcion = COALESCE(@descripcion, descripcion),
        id_departamento = COALESCE(@id_departamento, id_departamento),
        id_municipio = COALESCE(@id_municipio, id_municipio),
        fecha_hecho = COALESCE(@fecha_hecho, fecha_hecho),
        id_usuario_actualizacion = COALESCE(@id_usuario_actualizacion, id_usuario_actualizacion),
        estado_registro = COALESCE(@estado_registro, estado_registro),
        fecha_actualizacion = GETDATE()
    WHERE id_expediente = @id;

    SELECT * FROM dbo.TT_EXPEDIENTE WHERE id_expediente = @id;
END;
GO

IF OBJECT_ID('dbo.sp_eliminar_expediente', 'P') IS NULL
BEGIN
    EXEC('CREATE PROCEDURE dbo.sp_eliminar_expediente AS BEGIN SET NOCOUNT ON; SELECT -1 AS placeholder; END');
END
GO
CREATE OR ALTER PROCEDURE dbo.sp_eliminar_expediente
    @id INT,
    @id_usuario_actualizacion INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.TT_EXPEDIENTE
    SET estado_registro = 0,
        fecha_actualizacion = GETDATE(),
        id_usuario_actualizacion = COALESCE(@id_usuario_actualizacion, id_usuario_actualizacion)
    WHERE id_expediente = @id;

    SELECT @@ROWCOUNT AS affected;
END;
GO

/* Obtener expedientes por usuario (id_usuario_registro) */
IF OBJECT_ID('dbo.sp_obtener_expedientes_por_usuario', 'P') IS NULL
BEGIN
    EXEC('CREATE PROCEDURE dbo.sp_obtener_expedientes_por_usuario AS BEGIN SET NOCOUNT ON; SELECT -1 AS placeholder; END');
END
GO
CREATE OR ALTER PROCEDURE dbo.sp_obtener_expedientes_por_usuario
    @id_usuario INT
AS
BEGIN
    SET NOCOUNT ON;
        SELECT
                e.id_expediente,
                e.codigo_expediente,
                e.descripcion,
                e.id_departamento,
                e.id_municipio,
                e.fecha_hecho,
                e.id_usuario_registro,
                e.fecha_registro,
                e.id_usuario_actualizacion,
                e.fecha_actualizacion,
                e.estado_registro,
                e.id_ultimo_estado_expediente,
                est.nombre AS ultimo_estado_nombre
        FROM dbo.TT_EXPEDIENTE e
        LEFT JOIN dbo.TC_ESTADO_EXPEDIENTE est ON est.id_estado_expediente = e.id_ultimo_estado_expediente
        WHERE e.estado_registro = 1
            AND e.id_usuario_registro = @id_usuario
        ORDER BY e.fecha_registro DESC;
END;
GO

/* Stored procedures for Indicio (CRUD) */
IF OBJECT_ID('dbo.sp_crear_indicio', 'P') IS NULL
BEGIN
    EXEC('CREATE PROCEDURE dbo.sp_crear_indicio AS BEGIN SET NOCOUNT ON; SELECT -1 AS placeholder; END');
END
GO
CREATE OR ALTER PROCEDURE dbo.sp_crear_indicio
    @id_expediente INT,
    @numero_indicio INT,
    @descripcion VARCHAR(500),
    @id_tipo_indicio INT = NULL,
    @tipo VARCHAR(100) = NULL,
    @color VARCHAR(50) = NULL,
    @tamano VARCHAR(50) = NULL,
    @peso VARCHAR(50) = NULL,
    @ubicacion VARCHAR(200) = NULL,
    @observacion VARCHAR(200) = NULL,
    @id_usuario_registro INT,
    @id_usuario_actualizacion INT = NULL,
    @estado_registro TINYINT = 1
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO dbo.TT_INDICIO (
        id_expediente,
        numero_indicio,
        descripcion,
        id_tipo_indicio,
        tipo,
        color,
        tamano,
        peso,
        ubicacion,
        observacion,
        id_usuario_registro,
        id_usuario_actualizacion,
        estado_registro
    ) VALUES (
        @id_expediente,
        @numero_indicio,
        @descripcion,
        @id_tipo_indicio,
        @tipo,
        @color,
        @tamano,
        @peso,
        @ubicacion,
        @observacion,
        @id_usuario_registro,
        @id_usuario_actualizacion,
        @estado_registro
    );
    DECLARE @NewId INT = SCOPE_IDENTITY();
    SELECT @NewId AS id_indicio;
    SELECT * FROM dbo.TT_INDICIO WHERE id_indicio = @NewId;
END;
GO

IF OBJECT_ID('dbo.sp_obtener_indicio', 'P') IS NULL
BEGIN
    EXEC('CREATE PROCEDURE dbo.sp_obtener_indicio AS BEGIN SET NOCOUNT ON; SELECT -1 AS placeholder; END');
END
GO
CREATE OR ALTER PROCEDURE dbo.sp_obtener_indicio
    @id INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM dbo.TT_INDICIO WHERE id_indicio = @id AND estado_registro = 1;
END;
GO

/* Obtener indicios por expediente */
IF OBJECT_ID('dbo.sp_obtener_indicios_por_expediente', 'P') IS NULL
BEGIN
    EXEC('CREATE PROCEDURE dbo.sp_obtener_indicios_por_expediente AS BEGIN SET NOCOUNT ON; SELECT -1 AS placeholder; END');
END
GO
CREATE OR ALTER PROCEDURE dbo.sp_obtener_indicios_por_expediente
    @id_expediente INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        id_indicio,
        id_expediente,
        numero_indicio,
        descripcion,
        tipo,
        id_tipo_indicio,
        color,
        tamano,
        peso,
        ubicacion,
        observacion,
        id_usuario_registro,
        fecha_registro,
        id_usuario_actualizacion,
        fecha_actualizacion,
        estado_registro
    FROM dbo.TT_INDICIO
    WHERE estado_registro = 1
      AND id_expediente = @id_expediente
    ORDER BY numero_indicio ASC;
END;
GO

IF OBJECT_ID('dbo.sp_actualizar_indicio', 'P') IS NULL
BEGIN
    EXEC('CREATE PROCEDURE dbo.sp_actualizar_indicio AS BEGIN SET NOCOUNT ON; SELECT -1 AS placeholder; END');
END
GO
CREATE OR ALTER PROCEDURE dbo.sp_actualizar_indicio
    @id INT,
    @numero_indicio INT = NULL,
    @descripcion VARCHAR(500) = NULL,
    @id_tipo_indicio INT = NULL,
    @tipo VARCHAR(100) = NULL,
    @color VARCHAR(50) = NULL,
    @tamano VARCHAR(50) = NULL,
    @peso VARCHAR(50) = NULL,
    @ubicacion VARCHAR(200) = NULL,
    @observacion VARCHAR(200) = NULL,
    @id_usuario_actualizacion INT = NULL,
    @estado_registro TINYINT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.TT_INDICIO
    SET
        numero_indicio = COALESCE(@numero_indicio, numero_indicio),
        descripcion = COALESCE(@descripcion, descripcion),
        id_tipo_indicio = COALESCE(@id_tipo_indicio, id_tipo_indicio),
        tipo = COALESCE(@tipo, tipo),
        color = COALESCE(@color, color),
        tamano = COALESCE(@tamano, tamano),
        peso = COALESCE(@peso, peso),
        ubicacion = COALESCE(@ubicacion, ubicacion),
        observacion = COALESCE(@observacion, observacion),
        id_usuario_actualizacion = COALESCE(@id_usuario_actualizacion, id_usuario_actualizacion),
        estado_registro = COALESCE(@estado_registro, estado_registro),
        fecha_actualizacion = GETDATE()
    WHERE id_indicio = @id;

    SELECT * FROM dbo.TT_INDICIO WHERE id_indicio = @id;
END;
GO

IF OBJECT_ID('dbo.sp_eliminar_indicio', 'P') IS NULL
BEGIN
    EXEC('CREATE PROCEDURE dbo.sp_eliminar_indicio AS BEGIN SET NOCOUNT ON; SELECT -1 AS placeholder; END');
END
GO
CREATE OR ALTER PROCEDURE dbo.sp_eliminar_indicio
    @id INT,
    @id_usuario_actualizacion INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.TT_INDICIO
    SET estado_registro = 0,
        fecha_actualizacion = GETDATE(),
        id_usuario_actualizacion = COALESCE(@id_usuario_actualizacion, id_usuario_actualizacion)
    WHERE id_indicio = @id;

    SELECT @@ROWCOUNT AS affected;
END;
GO

/* Stored procedures for Expediente Estado (CRUD) */
IF OBJECT_ID('dbo.sp_crear_expediente_estado', 'P') IS NULL
BEGIN
    EXEC('CREATE PROCEDURE dbo.sp_crear_expediente_estado AS BEGIN SET NOCOUNT ON; SELECT -1 AS placeholder; END');
END
GO
CREATE OR ALTER PROCEDURE dbo.sp_crear_expediente_estado
    @id_expediente INT,
    @id_estado_expediente INT,
    @id_coordinador_revision INT,
    @motivo_rechazo VARCHAR(500) = NULL,
    @id_usuario_registro INT,
    @estado_registro TINYINT = 1
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO dbo.TT_EXPEDIENTE_ESTADO (
        id_expediente,
        id_estado_expediente,
        id_coordinador_revision,
        motivo_rechazo,
        id_usuario_registro,
        estado_registro
    ) VALUES (
        @id_expediente,
        @id_estado_expediente,
        @id_coordinador_revision,
        @motivo_rechazo,
        @id_usuario_registro,
        @estado_registro
    );
    DECLARE @NewId INT = SCOPE_IDENTITY();
    -- update expediente's last estado pointer
    UPDATE dbo.TT_EXPEDIENTE
    SET id_ultimo_estado_expediente = @id_estado_expediente
    WHERE id_expediente = @id_expediente;
    SELECT @NewId AS id_expediente_estado;
    SELECT * FROM dbo.TT_EXPEDIENTE_ESTADO WHERE id_expediente_estado = @NewId;
END;
GO

IF OBJECT_ID('dbo.sp_obtener_expediente_estado', 'P') IS NULL
BEGIN
    EXEC('CREATE PROCEDURE dbo.sp_obtener_expediente_estado AS BEGIN SET NOCOUNT ON; SELECT -1 AS placeholder; END');
END
GO
CREATE OR ALTER PROCEDURE dbo.sp_obtener_expediente_estado
    @id INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * FROM dbo.TT_EXPEDIENTE_ESTADO WHERE id_expediente_estado = @id AND estado_registro = 1;
END;
GO

-- Catalog / Query: obtener todos los estados de un expediente por su id_expediente
IF OBJECT_ID('dbo.sp_obtener_expediente_estados_por_expediente', 'P') IS NULL
BEGIN
    EXEC('CREATE PROCEDURE dbo.sp_obtener_expediente_estados_por_expediente AS BEGIN SET NOCOUNT ON; SELECT -1 AS placeholder; END');
END
GO
CREATE OR ALTER PROCEDURE dbo.sp_obtener_expediente_estados_por_expediente
    @id_expediente INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        id_expediente_estado,
        id_expediente,
        id_estado_expediente,
        id_coordinador_revision,
        motivo_rechazo,
        id_usuario_registro,
        fecha_registro,
        estado_registro
    FROM dbo.TT_EXPEDIENTE_ESTADO
    WHERE estado_registro = 1
      AND id_expediente = @id_expediente
    ORDER BY fecha_registro DESC;
END;
GO

IF OBJECT_ID('dbo.sp_actualizar_expediente_estado', 'P') IS NULL
BEGIN
    EXEC('CREATE PROCEDURE dbo.sp_actualizar_expediente_estado AS BEGIN SET NOCOUNT ON; SELECT -1 AS placeholder; END');
END
GO
CREATE OR ALTER PROCEDURE dbo.sp_actualizar_expediente_estado
    @id INT,
    @id_expediente INT = NULL,
    @id_estado_expediente INT = NULL,
    @id_coordinador_revision INT = NULL,
    @motivo_rechazo VARCHAR(500) = NULL,
    @id_usuario_actualizacion INT = NULL,
    @estado_registro TINYINT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.TT_EXPEDIENTE_ESTADO
    SET
        id_expediente = COALESCE(@id_expediente, id_expediente),
        id_estado_expediente = COALESCE(@id_estado_expediente, id_estado_expediente),
        id_coordinador_revision = COALESCE(@id_coordinador_revision, id_coordinador_revision),
        motivo_rechazo = COALESCE(@motivo_rechazo, motivo_rechazo),
        id_usuario_registro = COALESCE(@id_usuario_actualizacion, id_usuario_registro),
        estado_registro = COALESCE(@estado_registro, estado_registro)
    WHERE id_expediente_estado = @id;

    SELECT * FROM dbo.TT_EXPEDIENTE_ESTADO WHERE id_expediente_estado = @id;
END;
GO

IF OBJECT_ID('dbo.sp_eliminar_expediente_estado', 'P') IS NULL
BEGIN
    EXEC('CREATE PROCEDURE dbo.sp_eliminar_expediente_estado AS BEGIN SET NOCOUNT ON; SELECT -1 AS placeholder; END');
END
GO
CREATE OR ALTER PROCEDURE dbo.sp_eliminar_expediente_estado
    @id INT,
    @id_usuario_actualizacion INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.TT_EXPEDIENTE_ESTADO
    SET estado_registro = 0,
        fecha_registro = GETDATE(),
        id_usuario_registro = COALESCE(@id_usuario_actualizacion, id_usuario_registro)
    WHERE id_expediente_estado = @id;

    SELECT @@ROWCOUNT AS affected;
END;
GO

/* Stored procedures for catalog retrieval (TC_ tables) */
-- Catalog: estados (list only)
IF OBJECT_ID('dbo.sp_obtener_estado_expediente', 'P') IS NULL
BEGIN
    EXEC('CREATE PROCEDURE dbo.sp_obtener_estado_expediente AS BEGIN SET NOCOUNT ON; SELECT -1 AS placeholder; END');
END
GO
CREATE OR ALTER PROCEDURE dbo.sp_obtener_estado_expediente
AS
BEGIN
    SET NOCOUNT ON;
    SELECT id_estado_expediente, nombre, descripcion
    FROM dbo.TC_ESTADO_EXPEDIENTE
    WHERE estado_registro = 1
    ORDER BY nombre;
END;
GO

-- Catalog: departamentos (list only)
IF OBJECT_ID('dbo.sp_obtener_departamentos', 'P') IS NULL
BEGIN
    EXEC('CREATE PROCEDURE dbo.sp_obtener_departamentos AS BEGIN SET NOCOUNT ON; SELECT -1 AS placeholder; END');
END
GO
CREATE OR ALTER PROCEDURE dbo.sp_obtener_departamentos
AS
BEGIN
    SET NOCOUNT ON;
    SELECT id_departamento, nombre
    FROM dbo.TC_DEPARTAMENTO
    WHERE estado_registro = 1
    ORDER BY nombre;
END;
GO

-- Catalog: municipios (list, optional department filter)
IF OBJECT_ID('dbo.sp_obtener_municipios', 'P') IS NULL
BEGIN
    EXEC('CREATE PROCEDURE dbo.sp_obtener_municipios AS BEGIN SET NOCOUNT ON; SELECT -1 AS placeholder; END');
END
GO
CREATE OR ALTER PROCEDURE dbo.sp_obtener_municipios
    @id_departamento INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT id_municipio, id_departamento, nombre
    FROM dbo.TC_MUNICIPIO
    WHERE estado_registro = 1
      AND (@id_departamento IS NULL OR id_departamento = @id_departamento)
    ORDER BY nombre;
END;
GO

-- Catalog: tipos de indicio
IF OBJECT_ID('dbo.sp_obtener_tipos_indicio', 'P') IS NULL
BEGIN
    EXEC('CREATE PROCEDURE dbo.sp_obtener_tipos_indicio AS BEGIN SET NOCOUNT ON; SELECT -1 AS placeholder; END');
END
GO
CREATE OR ALTER PROCEDURE dbo.sp_obtener_tipos_indicio
AS
BEGIN
    SET NOCOUNT ON;
    SELECT id_tipo_indicio, nombre, descripcion
    FROM dbo.TC_TIPO_INDICIO
    WHERE estado_registro = 1
    ORDER BY nombre;
END;
GO

/* Reporting: summary counts by estado and total registros within date range */
IF OBJECT_ID('dbo.sp_report_summary', 'P') IS NULL
BEGIN
    EXEC('CREATE PROCEDURE dbo.sp_report_summary AS BEGIN SET NOCOUNT ON; SELECT -1 AS placeholder; END');
END
GO
CREATE OR ALTER PROCEDURE dbo.sp_report_summary
    @fecha_inicio DATETIME = NULL,
    @fecha_fin DATETIME = NULL,
    @id_estado INT = NULL -- optional filter for specific Estado in the estado counts
AS
BEGIN
    SET NOCOUNT ON;

    -- Normalize date filtering: if provided, use inclusive range
    DECLARE @start DATETIME = @fecha_inicio;
    DECLARE @end DATETIME = @fecha_fin;

    -- First resultset: counts grouped by estado (from TT_EXPEDIENTE_ESTADO)
    SELECT
        est.id_estado_expediente,
        est.nombre AS nombre_estado,
        COUNT(1) AS cantidad
    FROM dbo.TT_EXPEDIENTE_ESTADO ee
    JOIN dbo.TC_ESTADO_EXPEDIENTE est ON est.id_estado_expediente = ee.id_estado_expediente
    WHERE ee.estado_registro = 1
      AND est.estado_registro = 1
      AND (@id_estado IS NULL OR ee.id_estado_expediente = @id_estado)
      AND (@start IS NULL OR ee.fecha_registro >= @start)
      AND (@end IS NULL OR ee.fecha_registro <= @end)
    GROUP BY est.id_estado_expediente, est.nombre
    ORDER BY cantidad DESC;

    -- Second resultset: total expedientes created in date range
    SELECT
        COUNT(1) AS total_expedientes_creados
    FROM dbo.TT_EXPEDIENTE e
    WHERE e.estado_registro = 1
      AND (@start IS NULL OR e.fecha_registro >= @start)
      AND (@end IS NULL OR e.fecha_registro <= @end);
END;
GO

/* Reporting: timeseries per day for estado transitions and for expedientes created */
IF OBJECT_ID('dbo.sp_report_timeseries', 'P') IS NULL
BEGIN
    EXEC('CREATE PROCEDURE dbo.sp_report_timeseries AS BEGIN SET NOCOUNT ON; SELECT -1 AS placeholder; END');
END
GO
CREATE OR ALTER PROCEDURE dbo.sp_report_timeseries
    @fecha_inicio DATETIME = NULL,
    @fecha_fin DATETIME = NULL,
    @id_estado INT = NULL -- optional: if provided, returns timeseries for this estado transitions
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @start DATETIME = @fecha_inicio;
    DECLARE @end DATETIME = @fecha_fin;

    -- Timeseries for estado transitions (grouped by date)
    SELECT
        CONVERT(date, ee.fecha_registro) AS fecha,
        COUNT(1) AS cantidad
    FROM dbo.TT_EXPEDIENTE_ESTADO ee
    WHERE ee.estado_registro = 1
      AND (@id_estado IS NULL OR ee.id_estado_expediente = @id_estado)
      AND (@start IS NULL OR ee.fecha_registro >= @start)
      AND (@end IS NULL OR ee.fecha_registro <= @end)
    GROUP BY CONVERT(date, ee.fecha_registro)
    ORDER BY fecha ASC;

    -- Timeseries for expedientes created (grouped by date)
    SELECT
        CONVERT(date, e.fecha_registro) AS fecha,
        COUNT(1) AS cantidad
    FROM dbo.TT_EXPEDIENTE e
    WHERE e.estado_registro = 1
      AND (@start IS NULL OR e.fecha_registro >= @start)
      AND (@end IS NULL OR e.fecha_registro <= @end)
    GROUP BY CONVERT(date, e.fecha_registro)
    ORDER BY fecha ASC;
END;
GO
