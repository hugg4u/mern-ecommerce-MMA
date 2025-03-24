import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'HELASHOP API Documentation',
      version: '1.0.0',
      description: 'API documentation for HELASHOP e-commerce application',
      contact: {
        name: 'mosh',
        url: 'https://helashop.vn',
        email: 'contact@helashop.vn'
      },
    },
    servers: [
      {
        url: 'http://localhost:9999',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./Routes/**/*.js', './app.js'], // Đường dẫn tới các tệp chứa API documentation
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec; 