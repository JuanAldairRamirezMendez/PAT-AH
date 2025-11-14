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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer = __importStar(require("multer"));
const path = __importStar(require("path"));
const excel_processor_service_1 = require("./services/excel-processor.service");
const machine_learning_service_1 = require("./services/machine-learning.service");
const weather_service_1 = require("./services/weather.service");
const excel_data_dto_1 = require("./dto/excel-data.dto");
// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
    destination: './uploads',
    filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        callback(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});
const fileFilter = (req, file, callback) => {
    if (file.mimetype.includes('excel') || file.mimetype.includes('spreadsheet') ||
        file.originalname.endsWith('.xlsx') || file.originalname.endsWith('.xls')) {
        callback(null, true);
    }
    else {
        callback(new common_1.BadRequestException('Solo se permiten archivos Excel (.xlsx, .xls)'), false);
    }
};
let AiController = class AiController {
    constructor(excelService, mlService, weatherService) {
        this.excelService = excelService;
        this.mlService = mlService;
        this.weatherService = weatherService;
    }
    /**
     * Subir y procesar archivo Excel
     */
    async uploadExcel(file) {
        if (!file) {
            throw new common_1.BadRequestException('No se proporcionó archivo Excel');
        }
        try {
            const excelData = await this.excelService.processExcelFile(file.path);
            const statistics = await this.excelService.getDataStatistics(excelData);
            const quality = await this.excelService.validateDataQuality(excelData);
            return {
                success: true,
                message: 'Archivo Excel procesado exitosamente',
                data: excelData,
                statistics,
                quality,
                fileInfo: {
                    originalName: file.originalname,
                    size: file.size,
                    path: file.path
                }
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Error procesando archivo: ${error.message}`);
        }
    }
    /**
     * Entrenar modelo de Machine Learning
     */
    async trainModel(trainingRequest) {
        var _a, _b, _c;
        try {
            // Procesar datos del Excel
            const excelData = await this.excelService.processExcelFile(trainingRequest.filePath);
            const trainingData = await this.excelService.prepareTrainingData(excelData, trainingRequest.targetColumn, trainingRequest.featureColumns, { missingValues: trainingRequest.missingValues, valSplit: trainingRequest.valSplit, testSplit: trainingRequest.testSplit, seed: trainingRequest.seed });
            // Validar que hay suficientes datos en el conjunto de entrenamiento
            const nTrain = trainingData.trainFeatures ? trainingData.trainFeatures.length : trainingData.features.length;
            if (nTrain < 10) {
                throw new common_1.BadRequestException('Se necesitan al menos 10 filas de datos para entrenar (después del split)');
            }
            // Preparar conjunto de entrenamiento (usar los splits si existen)
            const trainSet = {
                features: (_a = trainingData.trainFeatures) !== null && _a !== void 0 ? _a : trainingData.features,
                targets: (_b = trainingData.trainTargets) !== null && _b !== void 0 ? _b : trainingData.targets,
                featureNames: trainingData.featureNames,
                targetName: trainingData.targetName
            };
            let result;
            switch (trainingRequest.modelType) {
                case 'linear':
                    if (trainingRequest.featureColumns.length !== 1) {
                        throw new common_1.BadRequestException('Regresión lineal requiere exactamente una característica');
                    }
                    result = await this.mlService.trainLinearModel(trainSet, trainingRequest.modelName);
                    break;
                case 'multivariate':
                    result = await this.mlService.trainMultivariateModel(trainSet, trainingRequest.modelName);
                    break;
                case 'neural_network':
                    const hiddenLayers = ((_c = trainingRequest.neuralNetworkConfig) === null || _c === void 0 ? void 0 : _c.hiddenLayers) || [64, 32];
                    result = await this.mlService.trainNeuralNetworkModel(trainSet, trainingRequest.modelName, hiddenLayers);
                    break;
                default:
                    throw new common_1.BadRequestException(`Tipo de modelo no soportado: ${trainingRequest.modelType}`);
            }
            // Si hay conjunto de validación, evaluar y adjuntar métricas de validación
            if (trainingData.valFeatures && trainingData.valTargets && result.success) {
                try {
                    const valMetrics = await this.mlService.evaluateModel(result.modelId, trainingData.valFeatures, trainingData.valTargets);
                    // Combinar métricas
                    result.metrics = result.metrics || {};
                    result.metrics.valMse = valMetrics.mse;
                    result.metrics.valRmse = valMetrics.rmse;
                    result.metrics.valR2 = valMetrics.r2;
                }
                catch (err) {
                    // Solo loguear; no bloquear el éxito del entrenamiento
                    // eslint-disable-next-line no-console
                    console.warn('Error evaluando en validation set:', err.message || err);
                }
            }
            return result;
        }
        catch (error) {
            // Diferenciar errores de validación vs errores internos
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            // Importar InternalServerErrorException aquí para errores no esperados
            const { InternalServerErrorException } = await Promise.resolve().then(() => __importStar(require('@nestjs/common')));
            // Exponer el mensaje interno temporalmente para depuración local
            throw new InternalServerErrorException(`Error interno entrenando modelo: ${error.message}`);
        }
    }
    /**
     * Realizar predicción con modelo entrenado
     */
    async predict(request) {
        try {
            let weatherData;
            // Obtener datos meteorológicos si se solicita
            if (request.includeWeather && request.location) {
                if ('lat' in request.location) {
                    weatherData = await this.weatherService.getCurrentWeather(request.location.lat, request.location.lon);
                }
                else {
                    weatherData = await this.weatherService.getWeatherByCity(request.location.city);
                }
            }
            const prediction = await this.mlService.predict(request.modelId, request.inputData, weatherData);
            return prediction;
        }
        catch (error) {
            throw new common_1.BadRequestException(`Error realizando predicción: ${error.message}`);
        }
    }
    /**
     * Realizar predicción con datos climáticos específicos
     */
    async predictWithWeather(request) {
        try {
            // Procesar datos de entrada como array si es un objeto
            let inputData;
            if (Array.isArray(request.inputData)) {
                inputData = request.inputData;
            }
            else {
                // Convertir objeto a array basado en las características del modelo
                const models = this.mlService.getModelsInfo();
                const model = models.find(m => m.id === request.modelId);
                if (!model) {
                    throw new common_1.BadRequestException(`Modelo ${request.modelId} no encontrado`);
                }
                inputData = model.features.map(feature => request.inputData[feature] || 0);
            }
            const prediction = await this.mlService.predict(request.modelId, inputData, request.weatherData);
            return prediction;
        }
        catch (error) {
            throw new common_1.BadRequestException(`Error realizando predicción: ${error.message}`);
        }
    }
    /**
     * Obtener información de modelos disponibles
     */
    getModels() {
        return this.mlService.getModelsInfo();
    }
    /**
     * Obtener información de un modelo específico
     */
    getModel(modelId) {
        const models = this.mlService.getModelsInfo();
        const model = models.find(m => m.id === modelId);
        if (!model) {
            throw new common_1.BadRequestException(`Modelo ${modelId} no encontrado`);
        }
        return model;
    }
    /**
     * Eliminar un modelo
     */
    async deleteModel(modelId) {
        const success = await this.mlService.deleteModel(modelId);
        return {
            success,
            message: success ? 'Modelo eliminado exitosamente' : 'No se pudo eliminar el modelo'
        };
    }
    /**
     * Obtener datos meteorológicos actuales
     */
    async getCurrentWeather(lat, lon, city) {
        try {
            if (city) {
                return await this.weatherService.getWeatherByCity(city);
            }
            else if (lat !== undefined && lon !== undefined) {
                return await this.weatherService.getCurrentWeather(lat, lon);
            }
            else {
                // Coordenadas por defecto (Lima, Perú)
                return await this.weatherService.getCurrentWeather(-12.0464, -77.0428);
            }
        }
        catch (error) {
            throw new common_1.BadRequestException(`Error obteniendo datos del clima: ${error.message}`);
        }
    }
    /**
     * Obtener pronóstico del tiempo
     */
    async getForecast(lat, lon, city, days) {
        try {
            const forecastDays = days || 5;
            if (city) {
                // Primero obtener coordenadas de la ciudad
                const currentWeather = await this.weatherService.getWeatherByCity(city);
                // Para el forecast necesitamos las coordenadas, aquí usaremos coordenadas por defecto
                return await this.weatherService.getForecast(-12.0464, -77.0428, forecastDays);
            }
            else if (lat !== undefined && lon !== undefined) {
                return await this.weatherService.getForecast(lat, lon, forecastDays);
            }
            else {
                throw new common_1.BadRequestException('Se requieren coordenadas (lat, lon) o nombre de ciudad');
            }
        }
        catch (error) {
            throw new common_1.BadRequestException(`Error obteniendo pronóstico: ${error.message}`);
        }
    }
    /**
     * Obtener estado de la API del clima
     */
    async getWeatherApiStatus() {
        return await this.weatherService.getApiStatus();
    }
    /**
     * Análisis completo: predicción con múltiples modelos
     */
    async completeAnalysis(request) {
        try {
            const models = this.mlService.getModelsInfo();
            if (models.length === 0) {
                throw new common_1.BadRequestException('No hay modelos entrenados disponibles');
            }
            // Obtener datos meteorológicos si se solicita
            let weatherData;
            if (request.includeWeather && request.location) {
                if ('lat' in request.location) {
                    weatherData = await this.weatherService.getCurrentWeather(request.location.lat, request.location.lon);
                }
                else {
                    weatherData = await this.weatherService.getWeatherByCity(request.location.city);
                }
            }
            // Realizar predicciones con todos los modelos disponibles
            const predictions = [];
            for (const model of models) {
                try {
                    const prediction = await this.mlService.predict(model.id, request.inputData, weatherData);
                    predictions.push({
                        modelInfo: model,
                        prediction
                    });
                }
                catch (error) {
                    predictions.push({
                        modelInfo: model,
                        error: error.message
                    });
                }
            }
            // Calcular predicción promedio de modelos exitosos
            const successfulPredictions = predictions
                .filter(p => !p.error && typeof p.prediction.prediction === 'number')
                .map(p => p.prediction.prediction);
            const averagePrediction = successfulPredictions.length > 0 ?
                successfulPredictions.reduce((a, b) => a + b, 0) / successfulPredictions.length :
                null;
            return {
                success: true,
                averagePrediction,
                weatherData,
                modelPredictions: predictions,
                summary: {
                    totalModels: models.length,
                    successfulPredictions: successfulPredictions.length,
                    averageConfidence: predictions
                        .filter(p => !p.error)
                        .reduce((sum, p) => sum + p.prediction.confidence, 0) /
                        predictions.filter(p => !p.error).length || 0
                }
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Error en análisis completo: ${error.message}`);
        }
    }
    /**
     * Health check del microservicio
     */
    async healthCheck() {
        const weatherStatus = await this.weatherService.getApiStatus();
        const models = this.mlService.getModelsInfo();
        return {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: {
                excelProcessor: 'ok',
                machineLearning: 'ok',
                weather: weatherStatus.status
            },
            modelsCount: models.length,
            version: '1.0.0'
        };
    }
};
exports.AiController = AiController;
__decorate([
    (0, common_1.Post)('upload-excel'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage,
        fileFilter,
        limits: { fileSize: 10 * 1024 * 1024 } // 10MB límite
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "uploadExcel", null);
__decorate([
    (0, common_1.Post)('train-model'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "trainModel", null);
__decorate([
    (0, common_1.Post)('predict'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "predict", null);
__decorate([
    (0, common_1.Post)('predict-with-weather'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [excel_data_dto_1.PredictionRequestDto]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "predictWithWeather", null);
__decorate([
    (0, common_1.Get)('models'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Array)
], AiController.prototype, "getModels", null);
__decorate([
    (0, common_1.Get)('models/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", excel_data_dto_1.ModelInfoDto)
], AiController.prototype, "getModel", null);
__decorate([
    (0, common_1.Delete)('models/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "deleteModel", null);
__decorate([
    (0, common_1.Get)('weather/current'),
    __param(0, (0, common_1.Query)('lat')),
    __param(1, (0, common_1.Query)('lon')),
    __param(2, (0, common_1.Query)('city')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "getCurrentWeather", null);
__decorate([
    (0, common_1.Get)('weather/forecast'),
    __param(0, (0, common_1.Query)('lat')),
    __param(1, (0, common_1.Query)('lon')),
    __param(2, (0, common_1.Query)('city')),
    __param(3, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, Number]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "getForecast", null);
__decorate([
    (0, common_1.Get)('weather/status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AiController.prototype, "getWeatherApiStatus", null);
__decorate([
    (0, common_1.Post)('analyze-complete'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AiController.prototype, "completeAnalysis", null);
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AiController.prototype, "healthCheck", null);
exports.AiController = AiController = __decorate([
    (0, common_1.Controller)('ai'),
    __metadata("design:paramtypes", [excel_processor_service_1.ExcelProcessorService,
        machine_learning_service_1.MachineLearningService,
        weather_service_1.WeatherService])
], AiController);
//# sourceMappingURL=ai.controller.js.map