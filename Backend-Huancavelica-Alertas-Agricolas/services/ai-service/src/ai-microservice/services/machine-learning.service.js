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
var MachineLearningService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MachineLearningService = void 0;
const common_1 = require("@nestjs/common");
// Intentar cargar bindings nativas de tfjs-node; si fallan, hacer fallback a tfjs (JS)
let tf;
try {
    tf = require('@tensorflow/tfjs-node');
    // eslint-disable-next-line no-console
    console.log('Using @tensorflow/tfjs-node native bindings');
}
catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Could not load @tensorflow/tfjs-node native bindings. Falling back to @tensorflow/tfjs (JS). Performance may be slower.');
    tf = require('@tensorflow/tfjs');
}
const ml_matrix_1 = require("ml-matrix");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Implementación simple de regresión lineal
class SimpleLinearRegression {
    constructor(x, y) {
        const n = x.length;
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
        this.slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        this.intercept = (sumY - this.slope * sumX) / n;
    }
    predict(x) {
        return this.slope * x + this.intercept;
    }
    toString() {
        return `y = ${this.slope.toFixed(4)}x + ${this.intercept.toFixed(4)}`;
    }
}
// Implementación simple de regresión multivariante
class MultivariateLinearRegression {
    constructor(X, y) {
        // Agregar columna de unos para el intercepto y trabajar con arrays puros
        const X2D = X.to2DArray().map(row => [...row, 1]);
        const nRows = X2D.length;
        const nCols = X2D[0].length;
        // Construir X^T * X (nCols x nCols) y X^T * y (nCols)
        const XTX = Array.from({ length: nCols }, () => Array(nCols).fill(0));
        const XTy = Array(nCols).fill(0);
        for (let i = 0; i < nRows; i++) {
            for (let j = 0; j < nCols; j++) {
                XTy[j] += X2D[i][j] * y[i];
                for (let k = 0; k < nCols; k++) {
                    XTX[j][k] += X2D[i][j] * X2D[i][k];
                }
            }
        }
        // Resolver el sistema lineal XTX * w = XTy usando eliminación de Gauss (con pivoteo parcial)
        const weights = MultivariateLinearRegression.solveLinearSystem(XTX, XTy);
        this.weights = weights;
    }
    static solveLinearSystem(A, b) {
        const n = A.length;
        // Crear matrices copia (A | b)
        const M = A.map(row => row.slice());
        const rhs = b.slice();
        for (let i = 0; i < n; i++) {
            // Pivoteo parcial
            let maxRow = i;
            for (let k = i + 1; k < n; k++) {
                if (Math.abs(M[k][i]) > Math.abs(M[maxRow][i]))
                    maxRow = k;
            }
            if (maxRow !== i) {
                const tmp = M[i];
                M[i] = M[maxRow];
                M[maxRow] = tmp;
                const tmpb = rhs[i];
                rhs[i] = rhs[maxRow];
                rhs[maxRow] = tmpb;
            }
            // Si el pivote es cero, añadir una pequeña regularización
            if (Math.abs(M[i][i]) < 1e-12)
                M[i][i] = 1e-12;
            // Eliminar filas debajo
            for (let k = i + 1; k < n; k++) {
                const factor = M[k][i] / M[i][i];
                rhs[k] -= factor * rhs[i];
                for (let j = i; j < n; j++) {
                    M[k][j] -= factor * M[i][j];
                }
            }
        }
        // Sustitución regresiva
        const x = Array(n).fill(0);
        for (let i = n - 1; i >= 0; i--) {
            let sum = rhs[i];
            for (let j = i + 1; j < n; j++)
                sum -= M[i][j] * x[j];
            x[i] = sum / M[i][i];
        }
        return x;
    }
    predict(x) {
        return x.reduce((sum, val, i) => sum + val * this.weights[i], 0) + this.weights[this.weights.length - 1];
    }
}
let MachineLearningService = MachineLearningService_1 = class MachineLearningService {
    constructor() {
        this.logger = new common_1.Logger(MachineLearningService_1.name);
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
            // Extraer X e Y
            const X = data.features.map(feature => feature[0]);
            const Y = data.targets;
            // Crear y entrenar modelo
            const model = new SimpleLinearRegression(X, Y);
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
                    equation: model.toString()
                },
                metadata: {
                    accuracy: metrics.r2,
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
                accuracy: metrics.r2,
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
            // Detectar si las features ya vienen normalizadas (mean ~0, std ~1)
            const featureCount = data.features[0].length;
            const featureMeans = [];
            const featureStds = [];
            for (let i = 0; i < featureCount; i++) {
                const col = data.features.map(r => r[i]);
                const mean = col.reduce((a, b) => a + b, 0) / col.length;
                const std = Math.sqrt(col.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / col.length) || 1;
                featureMeans.push(mean);
                featureStds.push(std);
            }
            const looksNormalized = featureMeans.every(m => Math.abs(m) < 0.5) && featureStds.every(s => s > 0.8 && s < 1.2);
            let model;
            let metrics;
            let normalizationParams = null;
            if (looksNormalized) {
                // Datos ya normalizados: entrenar directamente sobre las features tal cual
                const X = new ml_matrix_1.Matrix(data.features);
                const Y = data.targets;
                model = new MultivariateLinearRegression(X, Y);
                const predictions = data.features.map(feature => model.predict(feature));
                metrics = this.calculateMetrics(Y, predictions);
                // Guardar parámetros que indican que las features ya estaban normalizadas
                const targetMean = Y.reduce((a, b) => a + b, 0) / Y.length;
                const targetStd = Math.sqrt(Y.reduce((s, v) => s + Math.pow(v - targetMean, 2), 0) / Y.length) || 1;
                normalizationParams = {
                    featureMeans,
                    featureStds,
                    targetMean,
                    targetStd,
                    targetWasNormalized: false
                };
            }
            else {
                // Normalizar internamente (como en la rama NN)
                const normalized = this.normalizeData(data);
                const X = new ml_matrix_1.Matrix(normalized.features);
                const Y = normalized.targets;
                model = new MultivariateLinearRegression(X, Y);
                const predictionsNorm = normalized.features.map(feature => model.predict(feature));
                metrics = this.calculateMetrics(Y, predictionsNorm);
                normalizationParams = {
                    ...normalized.normalizationParams,
                    targetWasNormalized: true
                };
            }
            // Guardar modelo
            const modelId = this.generateModelId();
            const storedModel = {
                id: modelId,
                name: modelName,
                type: 'multivariate',
                features: data.featureNames,
                target: data.targetName,
                model: {
                    // Coefficients are as trained (may be for normalized or raw feature space)
                    coefficients: model.weights,
                    normalization: normalizationParams,
                    equation: this.buildEquation(data.featureNames, model.weights)
                },
                metadata: {
                    accuracy: metrics.r2,
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
                accuracy: metrics.r2,
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
     * Entrena una red neuronal con TensorFlow.js
     */
    async trainNeuralNetworkModel(data, modelName = 'neural_network_model', hiddenLayers = [64, 32]) {
        const startTime = Date.now();
        try {
            // Normalizar datos
            const normalizedData = this.normalizeData(data);
            // Crear tensores
            const xs = tf.tensor2d(normalizedData.features);
            const ys = tf.tensor2d(normalizedData.targets, [normalizedData.targets.length, 1]);
            // Crear modelo
            const model = tf.sequential();
            // Capa de entrada
            model.add(tf.layers.dense({
                inputShape: [data.features[0].length],
                units: hiddenLayers[0],
                activation: 'relu'
            }));
            // Capas ocultas
            for (let i = 1; i < hiddenLayers.length; i++) {
                model.add(tf.layers.dense({
                    units: hiddenLayers[i],
                    activation: 'relu'
                }));
                model.add(tf.layers.dropout({ rate: 0.2 }));
            }
            // Capa de salida
            model.add(tf.layers.dense({ units: 1, activation: 'linear' }));
            // Compilar modelo
            model.compile({
                optimizer: tf.train.adam(0.01),
                loss: 'meanSquaredError',
                metrics: ['mse']
            });
            // Entrenar modelo
            const history = await model.fit(xs, ys, {
                epochs: 100,
                batchSize: 32,
                validationSplit: 0.2,
                verbose: 0
            });
            // Calcular métricas en el conjunto de entrenamiento
            const predictions = await model.predict(xs);
            const predictionValues = await predictions.data();
            const metrics = this.calculateMetrics(normalizedData.targets, Array.from(predictionValues));
            // Guardar modelo
            const modelId = this.generateModelId();
            const modelPath = path.join(this.modelsDir, `${modelId}_model`);
            // Intentar guardar con el handler nativo (file://) y, si falla
            // (por ejemplo usando @tensorflow/tfjs sin bindings nativas),
            // usar un saveHandler personalizado que escriba model.json y weights.bin
            try {
                await model.save(`file://${modelPath}`);
            }
            catch (saveErr) {
                // Fallback: escribir modelArtifacts manualmente
                const handler = tf.io.withSaveHandler(async (artifacts) => {
                    if (!fs.existsSync(modelPath))
                        fs.mkdirSync(modelPath, { recursive: true });
                    // Construir model.json con manifest de pesos apuntando a 'weights.bin'
                    const modelJson = {
                        modelTopology: artifacts.modelTopology,
                        format: artifacts.format || 'layers-model',
                        generatedBy: artifacts.generatedBy,
                        convertedBy: artifacts.convertedBy,
                        weightsManifest: [
                            {
                                paths: ['weights.bin'],
                                weights: artifacts.weightSpecs
                            }
                        ]
                    };
                    fs.writeFileSync(path.join(modelPath, 'model.json'), JSON.stringify(modelJson, null, 2));
                    // Escribir weights.bin (ArrayBuffer -> Buffer)
                    if (artifacts.weightData) {
                        const buf = Buffer.from(artifacts.weightData);
                        fs.writeFileSync(path.join(modelPath, 'weights.bin'), buf);
                    }
                    return {
                        modelArtifactsInfo: {
                            dateSaved: new Date(),
                            modelTopologyType: 'JSON',
                            weightDataBytes: artifacts.weightData ? artifacts.weightData.byteLength : 0
                        }
                    };
                });
                await model.save(handler);
            }
            const storedModel = {
                id: modelId,
                name: modelName,
                type: 'neural_network',
                features: data.featureNames,
                target: data.targetName,
                model: {
                    path: modelPath,
                    architecture: hiddenLayers,
                    normalization: normalizedData.normalizationParams
                },
                metadata: {
                    accuracy: metrics.r2,
                    createdAt: new Date(),
                    lastTrained: new Date(),
                    trainingMetrics: {
                        ...metrics,
                        finalLoss: history.history.loss[history.history.loss.length - 1],
                        epochs: 100
                    }
                }
            };
            this.models.set(modelId, storedModel);
            await this.saveModel(storedModel);
            // Limpiar memoria
            xs.dispose();
            ys.dispose();
            predictions.dispose();
            return {
                success: true,
                modelId,
                accuracy: metrics.r2,
                trainingTime: Date.now() - startTime,
                metrics: storedModel.metadata.trainingMetrics
            };
        }
        catch (error) {
            this.logger.error(`Error entrenando red neuronal: ${error.message}`);
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
     * Realiza predicciones con un modelo entrenado
     */
    async predict(modelId, inputData, weatherData) {
        try {
            const storedModel = this.models.get(modelId);
            if (!storedModel) {
                throw new Error(`Modelo ${modelId} no encontrado`);
            }
            let prediction;
            let confidence = 0.8; // Valor por defecto
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
                    confidence = storedModel.metadata.accuracy;
                    break;
                case 'multivariate':
                    const coefficients = storedModel.model.coefficients;
                    // Si el modelo incluye parámetros de normalización, aplicar la misma
                    // normalización a la entrada antes de multiplicar por los coeficientes,
                    // y desnormalizar la predicción final (coherente con el entrenamiento).
                    if (storedModel.model && storedModel.model.normalization) {
                        const norm = storedModel.model.normalization;
                        const normalizedInput = this.normalizeInput(finalInputData, norm);
                        const predNorm = coefficients.reduce((sum, coef, index) => {
                            return sum + (coef * (normalizedInput[index] || 0));
                        }, coefficients[coefficients.length - 1]);
                        // Si el target fue normalizado durante el entrenamiento, desnormalizar;
                        // en caso contrario, la predicción ya está en la escala del target.
                        if (norm && norm.targetWasNormalized) {
                            prediction = this.denormalizePrediction(predNorm, norm);
                        }
                        else {
                            prediction = predNorm;
                        }
                    }
                    else {
                        // Legacy behavior: directly apply coefficients to raw features
                        prediction = coefficients.reduce((sum, coef, index) => {
                            return sum + (coef * (finalInputData[index] || 0));
                        }, coefficients[coefficients.length - 1]);
                    }
                    confidence = storedModel.metadata.accuracy;
                    break;
                case 'neural_network':
                    let model;
                    try {
                        model = await tf.loadLayersModel(`file://${storedModel.model.path}/model.json`);
                    }
                    catch (loadErr) {
                        // Fallback: cuando estamos usando @tensorflow/tfjs (JS) sin bindings nativas,
                        // tf.loadLayersModel('file://') puede fallar por un fetch interno. Intentar
                        // leer model.json y weights.bin desde disco y cargar usando un loadHandler.
                        try {
                            const modelJsonPath = path.join(storedModel.model.path, 'model.json');
                            const weightsPath = path.join(storedModel.model.path, 'weights.bin');
                            const modelJson = JSON.parse(fs.readFileSync(modelJsonPath, 'utf8'));
                            const weightsBuf = fs.readFileSync(weightsPath);
                            // Convertir Buffer a ArrayBuffer
                            const weightData = weightsBuf.buffer.slice(weightsBuf.byteOffset, weightsBuf.byteOffset + weightsBuf.byteLength);
                            // Construir un IOHandler compatible con la API de TFJS (JS)
                            // El handler expone un método async `load()` que devuelve los
                            // modelArtifacts esperados por `tf.loadLayersModel`.
                            const loadHandler = {
                                load: async () => {
                                    return {
                                        modelTopology: modelJson.modelTopology,
                                        format: modelJson.format || 'layers-model',
                                        generatedBy: modelJson.generatedBy,
                                        convertedBy: modelJson.convertedBy,
                                        weightSpecs: modelJson.weightsManifest && Array.isArray(modelJson.weightsManifest) && modelJson.weightsManifest[0] && modelJson.weightsManifest[0].weights ? modelJson.weightsManifest[0].weights : modelJson.weightSpecs,
                                        // weightData debe ser un ArrayBuffer
                                        weightData,
                                    };
                                }
                            };
                            // Cargar el modelo usando el IOHandler en memoria (funciona con tfjs JS)
                            model = await tf.loadLayersModel(loadHandler);
                        }
                        catch (fallbackErr) {
                            throw new Error(`No se pudo cargar el modelo TF: ${loadErr.message}; fallback: ${fallbackErr.message}`);
                        }
                    }
                    // Normalizar entrada usando los parámetros guardados
                    const normalizedInput = this.normalizeInput(finalInputData, storedModel.model.normalization);
                    const inputTensor = tf.tensor2d([normalizedInput]);
                    const predictionTensor = model.predict(inputTensor);
                    const predictionArray = await predictionTensor.data();
                    // Desnormalizar predicción
                    prediction = this.denormalizePrediction(predictionArray[0], storedModel.model.normalization);
                    confidence = storedModel.metadata.accuracy;
                    // Limpiar memoria
                    inputTensor.dispose();
                    predictionTensor.dispose();
                    if (model && typeof model.dispose === 'function')
                        model.dispose();
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
                weatherInfluence: weatherData ? 0.3 : undefined // Indicador de influencia del clima
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
     * Evalúa un modelo existente contra un conjunto de features/targets
     */
    async evaluateModel(modelId, features, targets) {
        const storedModel = this.models.get(modelId);
        if (!storedModel)
            throw new Error(`Modelo ${modelId} no encontrado`);
        // Calcular predicciones según el tipo de modelo
        let predictions = [];
        switch (storedModel.type) {
            case 'linear':
                predictions = features.map(f => {
                    if (f.length !== 1)
                        throw new Error('Modelo lineal requiere exactamente una característica');
                    return storedModel.model.slope * f[0] + storedModel.model.intercept;
                });
                break;
            case 'multivariate':
                const coeffs = storedModel.model.coefficients || [];
                predictions = features.map(f => {
                    return f.reduce((sum, val, idx) => sum + val * (coeffs[idx] || 0), 0) + (coeffs[coeffs.length - 1] || 0);
                });
                break;
            case 'neural_network':
                // Para redes neuronales, intentar cargar el modelo y predecir en batch
                try {
                    let model;
                    const tf = require('@tensorflow/tfjs');
                    try {
                        model = await require('@tensorflow/tfjs-node').loadLayersModel(`file://${storedModel.model.path}/model.json`);
                    }
                    catch (e) {
                        // Fallback a tfjs JS loadHandler similar al predict() implementation
                        const modelJsonPath = path.join(storedModel.model.path, 'model.json');
                        const weightsPath = path.join(storedModel.model.path, 'weights.bin');
                        const modelJson = JSON.parse(fs.readFileSync(modelJsonPath, 'utf8'));
                        const weightsBuf = fs.readFileSync(weightsPath);
                        const weightData = weightsBuf.buffer.slice(weightsBuf.byteOffset, weightsBuf.byteOffset + weightsBuf.byteLength);
                        const loadHandler = {
                            load: async () => ({
                                modelTopology: modelJson.modelTopology,
                                format: modelJson.format || 'layers-model',
                                generatedBy: modelJson.generatedBy,
                                convertedBy: modelJson.convertedBy,
                                weightSpecs: modelJson.weightsManifest && Array.isArray(modelJson.weightsManifest) && modelJson.weightsManifest[0] && modelJson.weightsManifest[0].weights ? modelJson.weightsManifest[0].weights : modelJson.weightSpecs,
                                weightData,
                            })
                        };
                        model = await tf.loadLayersModel(loadHandler);
                    }
                    // Normalizar features si aplica
                    const normalized = features.map(f => this.normalizeInput(f, storedModel.model.normalization));
                    const inputTensor = require('@tensorflow/tfjs').tensor2d(normalized);
                    const predsTensor = model.predict(inputTensor);
                    const predArray = await predsTensor.data();
                    predictions = Array.from(predArray).map((p) => this.denormalizePrediction(p, storedModel.model.normalization));
                    // Limpieza
                    if (inputTensor && typeof inputTensor.dispose === 'function')
                        inputTensor.dispose();
                    if (predsTensor && typeof predsTensor.dispose === 'function')
                        predsTensor.dispose();
                    if (model && typeof model.dispose === 'function')
                        model.dispose();
                }
                catch (err) {
                    // Si falla la evaluación con TF, devolver error para no enmascarar
                    throw new Error(`Error evaluando modelo neural: ${err.message}`);
                }
                break;
            default:
                throw new Error(`Tipo de modelo no soportado para evaluación: ${storedModel.type}`);
        }
        const metrics = this.calculateMetrics(targets, predictions);
        return metrics;
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
            // Eliminar archivos si es una red neuronal
            if (model.type === 'neural_network' && model.model.path) {
                const modelPath = model.model.path;
                if (fs.existsSync(modelPath)) {
                    fs.rmSync(modelPath, { recursive: true, force: true });
                }
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
    normalizeData(data) {
        // Calcular estadísticas para normalización
        const featureMeans = [];
        const featureStds = [];
        for (let i = 0; i < data.features[0].length; i++) {
            const column = data.features.map(row => row[i]);
            const mean = column.reduce((a, b) => a + b, 0) / column.length;
            const std = Math.sqrt(column.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / column.length);
            featureMeans.push(mean);
            featureStds.push(std || 1); // Evitar división por cero
        }
        const targetMean = data.targets.reduce((a, b) => a + b, 0) / data.targets.length;
        const targetStd = Math.sqrt(data.targets.reduce((sum, val) => sum + Math.pow(val - targetMean, 2), 0) / data.targets.length) || 1;
        // Normalizar features
        const normalizedFeatures = data.features.map(row => row.map((val, i) => (val - featureMeans[i]) / featureStds[i]));
        // Normalizar targets
        const normalizedTargets = data.targets.map(val => (val - targetMean) / targetStd);
        return {
            features: normalizedFeatures,
            targets: normalizedTargets,
            normalizationParams: {
                featureMeans,
                featureStds,
                targetMean,
                targetStd
            }
        };
    }
    normalizeInput(input, normalizationParams) {
        const { featureMeans, featureStds } = normalizationParams;
        return input.map((val, i) => (val - featureMeans[i]) / featureStds[i]);
    }
    denormalizePrediction(prediction, normalizationParams) {
        const { targetMean, targetStd } = normalizationParams;
        return prediction * targetStd + targetMean;
    }
    buildEquation(features, coefficients) {
        let equation = `${features[0]} = `;
        for (let i = 0; i < coefficients.length - 1; i++) {
            if (i > 0)
                equation += ' + ';
            equation += `${coefficients[i].toFixed(4)} * ${features[i]}`;
        }
        equation += ` + ${coefficients[coefficients.length - 1].toFixed(4)}`;
        return equation;
    }
    async saveModel(model) {
        const filePath = path.join(this.modelsDir, `${model.id}.json`);
        const modelData = {
            ...model,
            model: model.type === 'neural_network' ?
                { ...model.model, tfModel: undefined } : // No guardar el modelo TF en JSON
                model.model
        };
        fs.writeFileSync(filePath, JSON.stringify(modelData, null, 2));
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
exports.MachineLearningService = MachineLearningService;
exports.MachineLearningService = MachineLearningService = MachineLearningService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MachineLearningService);
//# sourceMappingURL=machine-learning.service.js.map