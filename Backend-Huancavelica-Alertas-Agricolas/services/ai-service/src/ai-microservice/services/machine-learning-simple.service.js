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
var MachineLearningServiceSimple_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MachineLearningServiceSimple = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Implementación simple de regresión lineal sin dependencias externas
class SimpleRegression {
    constructor(x, y) {
        const n = x.length;
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
        this.slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        this.intercept = (sumY - this.slope * sumX) / n;
        // Calcular R²
        const yMean = sumY / n;
        const ssRes = y.reduce((sum, yi, i) => sum + Math.pow(yi - this.predict(x[i]), 2), 0);
        const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
        this.r2 = 1 - (ssRes / ssTot);
    }
    predict(x) {
        return this.slope * x + this.intercept;
    }
}
// Implementación simple de regresión múltiple
class MultipleRegression {
    constructor(X, y) {
        // Implementación básica usando mínimos cuadrados
        const n = X.length;
        const m = X[0].length;
        // Agregar columna de unos para el intercepto
        const XWithIntercept = X.map(row => [...row, 1]);
        // Calcular coeficientes usando aproximación numérica
        this.coefficients = this.solveLinearSystem(XWithIntercept, y);
        // Calcular R²
        const yMean = y.reduce((a, b) => a + b, 0) / n;
        const predictions = X.map(row => this.predict(row));
        const ssRes = y.reduce((sum, yi, i) => sum + Math.pow(yi - predictions[i], 2), 0);
        const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
        this.r2 = 1 - (ssRes / ssTot);
    }
    predict(x) {
        return x.reduce((sum, val, i) => sum + val * this.coefficients[i], 0) +
            this.coefficients[this.coefficients.length - 1];
    }
    solveLinearSystem(X, y) {
        // Implementación simplificada usando eliminación gaussiana
        const n = X.length;
        const m = X[0].length;
        // Crear matriz aumentada
        const augmented = X.map((row, i) => [...row, y[i]]);
        // Eliminación hacia adelante
        for (let i = 0; i < Math.min(n, m); i++) {
            // Encontrar pivot
            let maxRow = i;
            for (let k = i + 1; k < n; k++) {
                if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
                    maxRow = k;
                }
            }
            // Intercambiar filas
            [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
            // Eliminar
            for (let k = i + 1; k < n; k++) {
                if (augmented[i][i] !== 0) {
                    const factor = augmented[k][i] / augmented[i][i];
                    for (let j = i; j <= m; j++) {
                        augmented[k][j] -= factor * augmented[i][j];
                    }
                }
            }
        }
        // Sustitución hacia atrás
        const solution = new Array(m).fill(0);
        for (let i = Math.min(n, m) - 1; i >= 0; i--) {
            solution[i] = augmented[i][m];
            for (let j = i + 1; j < m; j++) {
                solution[i] -= augmented[i][j] * solution[j];
            }
            if (augmented[i][i] !== 0) {
                solution[i] /= augmented[i][i];
            }
        }
        return solution;
    }
}
let MachineLearningServiceSimple = MachineLearningServiceSimple_1 = class MachineLearningServiceSimple {
    constructor() {
        this.logger = new common_1.Logger(MachineLearningServiceSimple_1.name);
        this.modelsDir = path.join(process.cwd(), 'trained-models');
        this.models = new Map();
        // Asegurar que el directorio de modelos existe
        if (!fs.existsSync(this.modelsDir)) {
            fs.mkdirSync(this.modelsDir, { recursive: true });
        }
        this.loadStoredModels();
    }
    /**
     * Entrena un modelo de regresión lineal simple
     */
    async trainLinearModel(data, modelName = 'linear_model') {
        const startTime = Date.now();
        try {
            if (data.features[0].length !== 1) {
                throw new Error('Regresión lineal simple requiere exactamente una característica');
            }
            const X = data.features.map(feature => feature[0]);
            const Y = data.targets;
            const model = new SimpleRegression(X, Y);
            // Calcular métricas
            const predictions = X.map(x => model.predict(x));
            const metrics = this.calculateMetrics(Y, predictions);
            // Guardar modelo
            const modelId = this.generateModelId();
            const storedModel = {
                id: modelId,
                name: modelName,
                type: 'linear',
                features: data.featureNames,
                target: data.targetName,
                model: {
                    slope: model.slope,
                    intercept: model.intercept,
                    r2: model.r2
                },
                metadata: {
                    accuracy: model.r2,
                    createdAt: new Date(),
                    lastTrained: new Date(),
                    trainingMetrics: metrics
                }
            };
            this.models.set(modelId, storedModel);
            await this.saveModel(storedModel);
            return {
                success: true,
                modelId,
                accuracy: model.r2,
                trainingTime: Date.now() - startTime,
                metrics
            };
        }
        catch (error) {
            this.logger.error(`Error entrenando modelo lineal: ${error.message}`);
            return {
                success: false,
                modelId: '',
                accuracy: 0,
                trainingTime: Date.now() - startTime,
                error: error.message,
                metrics: {}
            };
        }
    }
    /**
     * Entrena un modelo de regresión multivariante
     */
    async trainMultivariateModel(data, modelName = 'multivariate_model') {
        const startTime = Date.now();
        try {
            const model = new MultipleRegression(data.features, data.targets);
            // Calcular predicciones y métricas
            const predictions = data.features.map(feature => model.predict(feature));
            const metrics = this.calculateMetrics(data.targets, predictions);
            // Guardar modelo
            const modelId = this.generateModelId();
            const storedModel = {
                id: modelId,
                name: modelName,
                type: 'multivariate',
                features: data.featureNames,
                target: data.targetName,
                model: {
                    coefficients: model.coefficients,
                    r2: model.r2
                },
                metadata: {
                    accuracy: model.r2,
                    createdAt: new Date(),
                    lastTrained: new Date(),
                    trainingMetrics: metrics
                }
            };
            this.models.set(modelId, storedModel);
            await this.saveModel(storedModel);
            return {
                success: true,
                modelId,
                accuracy: model.r2,
                trainingTime: Date.now() - startTime,
                metrics
            };
        }
        catch (error) {
            this.logger.error(`Error entrenando modelo multivariante: ${error.message}`);
            return {
                success: false,
                modelId: '',
                accuracy: 0,
                trainingTime: Date.now() - startTime,
                error: error.message,
                metrics: {}
            };
        }
    }
    /**
     * Evaluar un modelo existente contra un conjunto de features/targets
     */
    async evaluateModel(modelId, features, targets) {
        const storedModel = this.models.get(modelId);
        if (!storedModel)
            throw new Error(`Modelo ${modelId} no encontrado`);
        // Calcular predicciones según el tipo de modelo
        const predictions = features.map(f => {
            switch (storedModel.type) {
                case 'linear':
                    if (f.length !== 1)
                        throw new Error('Modelo lineal requiere exactamente una característica');
                    return storedModel.model.slope * f[0] + storedModel.model.intercept;
                case 'multivariate':
                    const coeffs = storedModel.model.coefficients || [];
                    return f.reduce((sum, val, idx) => sum + val * (coeffs[idx] || 0), 0) + (coeffs[coeffs.length - 1] || 0);
                default:
                    throw new Error(`Tipo de modelo no soportado para evaluación: ${storedModel.type}`);
            }
        });
        // Calcular métricas
        const metrics = this.calculateMetrics(targets, predictions);
        return metrics;
    }
    /**
     * Realiza predicciones con un modelo entrenado
     */
    async predict(modelId, inputData, weatherData) {
        try {
            const storedModel = this.models.get(modelId);
            if (!storedModel) {
                throw new Error(`Modelo ${modelId} no encontrado`);
            }
            let prediction;
            let confidence = storedModel.metadata.accuracy;
            // Combinar datos de entrada con datos meteorológicos si están disponibles
            let finalInputData = inputData;
            if (weatherData && storedModel.features.some(f => f.includes('weather') || f.includes('clima'))) {
                const weatherFeatures = [
                    weatherData.temperature,
                    weatherData.humidity,
                    weatherData.precipitation,
                    weatherData.windSpeed
                ];
                finalInputData = [...inputData, ...weatherFeatures];
            }
            switch (storedModel.type) {
                case 'linear':
                    if (finalInputData.length !== 1) {
                        throw new Error('Modelo lineal requiere exactamente una característica');
                    }
                    prediction = storedModel.model.slope * finalInputData[0] + storedModel.model.intercept;
                    break;
                case 'multivariate':
                    const coefficients = storedModel.model.coefficients;
                    prediction = finalInputData.reduce((sum, val, index) => {
                        return sum + (val * (coefficients[index] || 0));
                    }, coefficients[coefficients.length - 1] || 0);
                    break;
                default:
                    throw new Error(`Tipo de modelo no soportado: ${storedModel.type}`);
            }
            return {
                prediction,
                confidence,
                modelUsed: modelId,
                inputData: finalInputData,
                timestamp: new Date(),
                weatherInfluence: weatherData ? 0.3 : undefined
            };
        }
        catch (error) {
            this.logger.error(`Error realizando predicción: ${error.message}`);
            throw new Error(`Error en predicción: ${error.message}`);
        }
    }
    /**
     * Obtiene información de todos los modelos disponibles
     */
    getModelsInfo() {
        return Array.from(this.models.values()).map(model => ({
            id: model.id,
            name: model.name,
            type: model.type,
            accuracy: model.metadata.accuracy,
            createdAt: model.metadata.createdAt,
            lastTrained: model.metadata.lastTrained,
            features: model.features,
            target: model.target,
            isActive: true
        }));
    }
    /**
     * Elimina un modelo
     */
    async deleteModel(modelId) {
        try {
            const model = this.models.get(modelId);
            if (!model) {
                return false;
            }
            // Eliminar archivo de metadatos
            const metadataPath = path.join(this.modelsDir, `${modelId}.json`);
            if (fs.existsSync(metadataPath)) {
                fs.unlinkSync(metadataPath);
            }
            this.models.delete(modelId);
            return true;
        }
        catch (error) {
            this.logger.error(`Error eliminando modelo ${modelId}: ${error.message}`);
            return false;
        }
    }
    // Métodos privados auxiliares
    generateModelId() {
        return `model_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    calculateMetrics(actual, predicted) {
        const n = actual.length;
        // MSE
        const mse = actual.reduce((sum, val, i) => {
            return sum + Math.pow(val - predicted[i], 2);
        }, 0) / n;
        // RMSE
        const rmse = Math.sqrt(mse);
        // R²
        const actualMean = actual.reduce((a, b) => a + b, 0) / n;
        const totalSumSquares = actual.reduce((sum, val) => {
            return sum + Math.pow(val - actualMean, 2);
        }, 0);
        const residualSumSquares = actual.reduce((sum, val, i) => {
            return sum + Math.pow(val - predicted[i], 2);
        }, 0);
        const r2 = 1 - (residualSumSquares / totalSumSquares);
        return { mse, rmse, r2 };
    }
    async saveModel(model) {
        const filePath = path.join(this.modelsDir, `${model.id}.json`);
        fs.writeFileSync(filePath, JSON.stringify(model, null, 2));
    }
    loadStoredModels() {
        try {
            const files = fs.readdirSync(this.modelsDir);
            const jsonFiles = files.filter(file => file.endsWith('.json'));
            for (const file of jsonFiles) {
                try {
                    const filePath = path.join(this.modelsDir, file);
                    const modelData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    this.models.set(modelData.id, modelData);
                }
                catch (error) {
                    this.logger.warn(`Error cargando modelo desde ${file}: ${error.message}`);
                }
            }
            this.logger.log(`Cargados ${this.models.size} modelos desde disco`);
        }
        catch (error) {
            this.logger.warn(`Error cargando modelos: ${error.message}`);
        }
    }
};
exports.MachineLearningServiceSimple = MachineLearningServiceSimple;
exports.MachineLearningServiceSimple = MachineLearningServiceSimple = MachineLearningServiceSimple_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MachineLearningServiceSimple);
//# sourceMappingURL=machine-learning-simple.service.js.map