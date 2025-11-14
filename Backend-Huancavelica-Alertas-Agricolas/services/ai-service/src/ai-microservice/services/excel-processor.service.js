"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExcelProcessorService = void 0;
const common_1 = require("@nestjs/common");
const XLSX = __importStar(require("xlsx"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let ExcelProcessorService = class ExcelProcessorService {
    constructor() {
        this.uploadsDir = path.join(process.cwd(), 'uploads');
        // Asegurar que el directorio de uploads existe
        if (!fs.existsSync(this.uploadsDir)) {
            fs.mkdirSync(this.uploadsDir, { recursive: true });
        }
    }
    /**
     * Procesa un archivo Excel y extrae los datos
     */
    async processExcelFile(filePath) {
        try {
            const workbook = XLSX.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            // Convertir a JSON con headers en la primera fila
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            if (jsonData.length === 0) {
                throw new common_1.BadRequestException('El archivo Excel está vacío');
            }
            const rawHeaders = jsonData[0];
            // Sanitizar nombres de columnas: quitar caracteres de control, null bytes y trim
            const headers = rawHeaders.map((h, idx) => {
                const s = h == null ? `column_${idx}` : String(h);
                // eliminar caracteres de control (incluye \u0000) y trim
                return s.replace(/[\x00-\x1F\x7F]/g, '').trim();
            });
            const data = jsonData.slice(1);
            // Limpiar datos nulos o undefined
            const cleanData = data
                .filter(row => row && row.some(cell => cell !== null && cell !== undefined))
                .map(row => {
                const obj = {};
                headers.forEach((header, index) => {
                    // usar el nombre de cabecera sanitizado como key
                    obj[header] = row[index] != null ? row[index] : null;
                });
                return obj;
            });
            const result = {
                fileName: path.basename(filePath),
                columns: headers,
                data: cleanData,
                rowCount: cleanData.length,
                uploadDate: new Date()
            };
            return result;
        }
        catch (error) {
            throw new common_1.BadRequestException(`Error procesando archivo Excel: ${error.message}`);
        }
    }
    /**
     * Valida y prepara los datos para entrenamiento
     */
    async prepareTrainingData(excelData, targetColumn, featureColumns, options) {
        var _a, _b, _c;
        try {
            // Validar que las columnas existen
            const missingColumns = [...featureColumns, targetColumn].filter(col => !excelData.columns.includes(col));
            if (missingColumns.length > 0) {
                throw new common_1.BadRequestException(`Columnas no encontradas: ${missingColumns.join(', ')}`);
            }
            // Extraer y limpiar datos
            const features = [];
            const targets = [];
            const missingVals = (_a = options === null || options === void 0 ? void 0 : options.missingValues) !== null && _a !== void 0 ? _a : [-99.9];
            const isMissing = (value) => {
                if (value === null || value === undefined || value === '')
                    return true;
                // Compare as number when possible
                if (typeof value === 'number') {
                    return missingVals.some(m => m === value);
                }
                const s = String(value).trim();
                return missingVals.some(m => String(m) === s);
            };
            excelData.data.forEach(row => {
                const featureValues = featureColumns.map(col => {
                    const raw = row[col];
                    if (isMissing(raw))
                        return NaN;
                    return this.convertToNumber(raw);
                });
                const rawTarget = row[targetColumn];
                if (isMissing(rawTarget))
                    return; // skip row
                const targetValue = this.convertToNumber(rawTarget);
                // Solo incluir filas con datos válidos
                if (featureValues.every(val => !isNaN(val)) && !isNaN(targetValue)) {
                    features.push(featureValues);
                    targets.push(targetValue);
                }
            });
            if (features.length === 0) {
                throw new common_1.BadRequestException('No se encontraron datos numéricos válidos para entrenamiento');
            }
            // Opcional: crear splits train/val/test
            const valSplit = (_b = options === null || options === void 0 ? void 0 : options.valSplit) !== null && _b !== void 0 ? _b : 0.15;
            const testSplit = (_c = options === null || options === void 0 ? void 0 : options.testSplit) !== null && _c !== void 0 ? _c : 0.15;
            const seed = options === null || options === void 0 ? void 0 : options.seed;
            // Shuffle with optional seed
            const indices = features.map((_, i) => i);
            const rng = this.seededRng(seed);
            for (let i = indices.length - 1; i > 0; i--) {
                const j = Math.floor(rng() * (i + 1));
                [indices[i], indices[j]] = [indices[j], indices[i]];
            }
            const shuffledFeatures = indices.map(i => features[i]);
            const shuffledTargets = indices.map(i => targets[i]);
            const n = shuffledFeatures.length;
            const nTest = Math.floor(n * testSplit);
            const nVal = Math.floor(n * valSplit);
            const nTrain = n - nVal - nTest;
            const trainFeatures = shuffledFeatures.slice(0, nTrain);
            const trainTargets = shuffledTargets.slice(0, nTrain);
            const valFeatures = shuffledFeatures.slice(nTrain, nTrain + nVal);
            const valTargets = shuffledTargets.slice(nTrain, nTrain + nVal);
            const testFeatures = shuffledFeatures.slice(nTrain + nVal);
            const testTargets = shuffledTargets.slice(nTrain + nVal);
            return {
                features,
                targets,
                featureNames: featureColumns,
                targetName: targetColumn,
                trainFeatures,
                trainTargets,
                valFeatures,
                valTargets,
                testFeatures,
                testTargets
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Error preparando datos de entrenamiento: ${error.message}`);
        }
    }
    // Generador de RNG con semilla simple (LCG)
    seededRng(seed) {
        if (seed === undefined || seed === null) {
            return Math.random;
        }
        let state = seed >>> 0;
        return function () {
            // LCG params
            state = (1664525 * state + 1013904223) >>> 0;
            return state / 0x100000000;
        };
    }
    /**
     * Convierte un valor a número, manejando diferentes formatos
     */
    convertToNumber(value) {
        if (typeof value === 'number') {
            return value;
        }
        if (typeof value === 'string') {
            // Remover comas, espacios y otros caracteres
            const cleaned = value.replace(/[,\s]/g, '');
            const parsed = parseFloat(cleaned);
            return isNaN(parsed) ? NaN : parsed;
        }
        return NaN;
    }
    /**
     * Obtiene estadísticas básicas de los datos
     */
    async getDataStatistics(excelData) {
        const statistics = {};
        excelData.columns.forEach(column => {
            const values = excelData.data
                .map(row => this.convertToNumber(row[column]))
                .filter(val => !isNaN(val));
            if (values.length > 0) {
                statistics[column] = {
                    count: values.length,
                    mean: values.reduce((a, b) => a + b, 0) / values.length,
                    min: Math.min(...values),
                    max: Math.max(...values),
                    std: this.calculateStandardDeviation(values)
                };
            }
        });
        return {
            totalRows: excelData.rowCount,
            totalColumns: excelData.columns.length,
            columnStatistics: statistics,
            missingDataPercentage: this.calculateMissingDataPercentage(excelData)
        };
    }
    calculateStandardDeviation(values) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
        return Math.sqrt(variance);
    }
    calculateMissingDataPercentage(excelData) {
        const missing = {};
        excelData.columns.forEach(column => {
            const nullCount = excelData.data.filter(row => row[column] === null ||
                row[column] === undefined ||
                row[column] === '').length;
            missing[column] = (nullCount / excelData.rowCount) * 100;
        });
        return missing;
    }
    /**
     * Valida la calidad de los datos para machine learning
     */
    async validateDataQuality(excelData) {
        const warnings = [];
        const recommendations = [];
        // Verificar tamaño mínimo del dataset
        if (excelData.rowCount < 50) {
            warnings.push('Dataset muy pequeño (< 50 filas). Se recomiendan al menos 100 filas para un buen entrenamiento.');
        }
        // Verificar datos faltantes
        const missingData = this.calculateMissingDataPercentage(excelData);
        Object.entries(missingData).forEach(([column, percentage]) => {
            const p = Number(percentage);
            if (p > 30) {
                warnings.push(`Columna "${column}" tiene ${p.toFixed(1)}% de datos faltantes.`);
                recommendations.push(`Considerar eliminar la columna "${column}" o imputar los valores faltantes.`);
            }
        });
        // Verificar variabilidad de los datos
        const stats = await this.getDataStatistics(excelData);
        Object.entries(stats.columnStatistics).forEach(([column, stat]) => {
            if (stat.std === 0) {
                warnings.push(`Columna "${column}" tiene varianza cero (todos los valores son iguales).`);
                recommendations.push(`Considerar eliminar la columna "${column}" ya que no aporta información.`);
            }
        });
        return {
            isValid: warnings.length < 5, // Criterio simple: máximo 5 warnings
            warnings,
            recommendations
        };
    }
};
exports.ExcelProcessorService = ExcelProcessorService;
exports.ExcelProcessorService = ExcelProcessorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ExcelProcessorService);
//# sourceMappingURL=excel-processor.service.js.map