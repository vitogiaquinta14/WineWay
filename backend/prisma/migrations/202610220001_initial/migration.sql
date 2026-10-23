-- CreateTable
CREATE TABLE "Bodega" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "localidad" TEXT NOT NULL,
    "zona" TEXT NOT NULL,
    "latitud" REAL NOT NULL,
    "longitud" REAL NOT NULL,
    "sitioWeb" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "caracteristicas" JSONB NOT NULL DEFAULT '[]',
    "fotos" JSONB NOT NULL DEFAULT '[]',
    "ratingDemostracion" REAL,
    "recomendada" BOOLEAN NOT NULL DEFAULT false,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    CHECK ("ratingDemostracion" IS NULL OR "ratingDemostracion" BETWEEN 0 AND 5)
);

-- CreateTable
CREATE TABLE "TipoExperiencia" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "gastronomia" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Experiencia" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bodegaId" TEXT NOT NULL,
    "tipoId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "precioCentavos" INTEGER NOT NULL,
    "duracionMin" INTEGER NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Experiencia_bodegaId_fkey" FOREIGN KEY ("bodegaId") REFERENCES "Bodega" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Experiencia_tipoId_fkey" FOREIGN KEY ("tipoId") REFERENCES "TipoExperiencia" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CHECK ("precioCentavos" >= 0 AND "duracionMin" > 0 AND "duracionMin" <= 1440)
);

-- CreateTable
CREATE TABLE "HorarioExperiencia" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "experienciaId" TEXT NOT NULL,
    "dia" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "desde" INTEGER NOT NULL,
    "hasta" INTEGER NOT NULL,
    CONSTRAINT "HorarioExperiencia_experienciaId_fkey" FOREIGN KEY ("experienciaId") REFERENCES "Experiencia" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CHECK ("dia" BETWEEN 1 AND 7 AND "desde" BETWEEN 0 AND 1439 AND "hasta" BETWEEN 0 AND 1440 AND (("tipo" = 'FIJO' AND "desde" = "hasta") OR ("tipo" = 'FLEXIBLE' AND "desde" < "hasta")))
);

-- CreateTable
CREATE TABLE "Vino" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bodegaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "precioCentavos" INTEGER NOT NULL,
    "codigoBarras" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "perfil" TEXT,
    "imagenUrl" TEXT,
    "codigoDePrueba" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Vino_bodegaId_fkey" FOREIGN KEY ("bodegaId") REFERENCES "Bodega" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CHECK ("precioCentavos" >= 0)
);

-- CreateTable
CREATE TABLE "Cepa" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "VinoCepa" (
    "vinoId" TEXT NOT NULL,
    "cepaId" TEXT NOT NULL,

    PRIMARY KEY ("vinoId", "cepaId"),
    CONSTRAINT "VinoCepa_vinoId_fkey" FOREIGN KEY ("vinoId") REFERENCES "Vino" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VinoCepa_cepaId_fkey" FOREIGN KEY ("cepaId") REFERENCES "Cepa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fechaNacimiento" TEXT NOT NULL,
    "apodo" TEXT,
    "fotoUrl" TEXT,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Sesion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "venceEn" DATETIME NOT NULL,
    CONSTRAINT "Sesion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VinoFueraDeCatalogo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "bodegaNombre" TEXT,
    "descripcion" TEXT,
    "precioCentavos" INTEGER,
    "cepasTexto" TEXT,
    "tipo" TEXT,
    "codigoBarras" TEXT,
    CONSTRAINT "VinoFueraDeCatalogo_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CHECK ("precioCentavos" IS NULL OR "precioCentavos" >= 0)
);

-- CreateTable
CREATE TABLE "VinoEnCava" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "vinoId" TEXT,
    "vinoManualId" TEXT,
    "anada" INTEGER,
    "valoracion" INTEGER,
    "nota" TEXT,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VinoEnCava_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VinoEnCava_vinoId_fkey" FOREIGN KEY ("vinoId") REFERENCES "Vino" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "VinoEnCava_vinoManualId_usuarioId_fkey" FOREIGN KEY ("vinoManualId", "usuarioId") REFERENCES "VinoFueraDeCatalogo" ("id", "usuarioId") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CHECK (("vinoId" IS NOT NULL) != ("vinoManualId" IS NOT NULL)),
    CHECK ("valoracion" IS NULL OR "valoracion" BETWEEN 1 AND 5)
);

-- CreateTable
CREATE TABLE "ResenaBodega" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "bodegaId" TEXT NOT NULL,
    "valoracion" INTEGER NOT NULL,
    "comentario" TEXT,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL,
    CONSTRAINT "ResenaBodega_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ResenaBodega_bodegaId_fkey" FOREIGN KEY ("bodegaId") REFERENCES "Bodega" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CHECK ("valoracion" BETWEEN 1 AND 5)
);

-- CreateTable
CREATE TABLE "BodegaFavorita" (
    "usuarioId" TEXT NOT NULL,
    "bodegaId" TEXT NOT NULL,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("usuarioId", "bodegaId"),
    CONSTRAINT "BodegaFavorita_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BodegaFavorita_bodegaId_fkey" FOREIGN KEY ("bodegaId") REFERENCES "Bodega" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Ruta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "fechaInicio" TEXT NOT NULL,
    "cantidadDias" INTEGER NOT NULL,
    "cantidadPersonas" INTEGER NOT NULL,
    "presupuestoPersonaCentavos" INTEGER NOT NULL,
    "parametros" JSONB NOT NULL DEFAULT '{}',
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Ruta_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CHECK ("cantidadDias" > 0 AND "cantidadPersonas" > 0 AND "presupuestoPersonaCentavos" >= 0)
);

-- CreateTable
CREATE TABLE "Visita" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rutaId" TEXT NOT NULL,
    "experienciaId" TEXT NOT NULL,
    "inicio" DATETIME NOT NULL,
    "nombreExperiencia" TEXT NOT NULL,
    "duracionMin" INTEGER NOT NULL,
    "trasladoMin" INTEGER,
    CONSTRAINT "Visita_rutaId_fkey" FOREIGN KEY ("rutaId") REFERENCES "Ruta" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Visita_experienciaId_fkey" FOREIGN KEY ("experienciaId") REFERENCES "Experiencia" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CHECK ("duracionMin" > 0 AND ("trasladoMin" IS NULL OR "trasladoMin" >= 0))
);

-- CreateIndex
CREATE INDEX "Bodega_zona_idx" ON "Bodega"("zona");

-- CreateIndex
CREATE UNIQUE INDEX "TipoExperiencia_nombre_key" ON "TipoExperiencia"("nombre");

-- CreateIndex
CREATE INDEX "Experiencia_bodegaId_idx" ON "Experiencia"("bodegaId");

-- CreateIndex
CREATE INDEX "Experiencia_tipoId_idx" ON "Experiencia"("tipoId");

-- CreateIndex
CREATE UNIQUE INDEX "HorarioExperiencia_experienciaId_dia_tipo_desde_hasta_key" ON "HorarioExperiencia"("experienciaId", "dia", "tipo", "desde", "hasta");

-- CreateIndex
CREATE UNIQUE INDEX "Vino_codigoBarras_key" ON "Vino"("codigoBarras");

-- CreateIndex
CREATE INDEX "Vino_bodegaId_idx" ON "Vino"("bodegaId");

-- CreateIndex
CREATE UNIQUE INDEX "Cepa_nombre_key" ON "Cepa"("nombre");

-- CreateIndex
CREATE INDEX "VinoCepa_cepaId_idx" ON "VinoCepa"("cepaId");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_username_key" ON "Usuario"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Sesion_tokenHash_key" ON "Sesion"("tokenHash");

-- CreateIndex
CREATE INDEX "Sesion_usuarioId_idx" ON "Sesion"("usuarioId");

-- CreateIndex
CREATE INDEX "VinoFueraDeCatalogo_usuarioId_idx" ON "VinoFueraDeCatalogo"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "VinoFueraDeCatalogo_id_usuarioId_key" ON "VinoFueraDeCatalogo"("id", "usuarioId");

-- CreateIndex
CREATE INDEX "VinoEnCava_usuarioId_creadoEn_idx" ON "VinoEnCava"("usuarioId", "creadoEn");

-- CreateIndex
CREATE INDEX "VinoEnCava_vinoId_idx" ON "VinoEnCava"("vinoId");

-- CreateIndex
CREATE INDEX "VinoEnCava_vinoManualId_usuarioId_idx" ON "VinoEnCava"("vinoManualId", "usuarioId");

-- CreateIndex
CREATE INDEX "ResenaBodega_bodegaId_idx" ON "ResenaBodega"("bodegaId");

-- CreateIndex
CREATE UNIQUE INDEX "ResenaBodega_usuarioId_bodegaId_key" ON "ResenaBodega"("usuarioId", "bodegaId");

-- CreateIndex
CREATE INDEX "BodegaFavorita_bodegaId_idx" ON "BodegaFavorita"("bodegaId");

-- CreateIndex
CREATE INDEX "Ruta_usuarioId_idx" ON "Ruta"("usuarioId");

-- CreateIndex
CREATE INDEX "Visita_rutaId_inicio_idx" ON "Visita"("rutaId", "inicio");

-- CreateIndex
CREATE INDEX "Visita_experienciaId_idx" ON "Visita"("experienciaId");

