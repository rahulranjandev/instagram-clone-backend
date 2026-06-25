import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';

const port = process.env.PORT ?? 3333;

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Instagram Clone API',
      version: '1.0.0',
      description: 'REST API documentation for authentication, users, and posts.',
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: 'Local development server',
      },
    ],
    tags: [
      { name: 'System', description: 'Service status endpoints' },
      { name: 'Authentication', description: 'Registration, sessions, and password management' },
      { name: 'Users', description: 'User profiles and follow relationships' },
      { name: 'Posts', description: 'Post creation, retrieval, and deletion' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'access_token',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          required: ['message'],
          properties: {
            message: {
              type: 'string',
              example: 'Invalid credentials',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '665f0d0eaebf7cc80d6fdb72' },
            name: { type: 'string', example: 'Ada Lovelace' },
            username: { type: 'string', example: 'ada' },
            email: { type: 'string', format: 'email', example: 'ada@example.com' },
            avatar: { type: 'string', format: 'uri' },
            followers: {
              type: 'array',
              items: { type: 'string' },
            },
            following: {
              type: 'array',
              items: { type: 'string' },
            },
            verified: { type: 'boolean', example: false },
            resgisteredDate: { type: 'string', format: 'date-time' },
          },
        },
        PublicUser: {
          type: 'object',
          properties: {
            username: { type: 'string', example: 'ada' },
            email: { type: 'string', format: 'email', example: 'ada@example.com' },
            name: { type: 'string', example: 'Ada Lovelace' },
            avatar: { type: 'string', format: 'uri' },
            followers: { type: 'integer', example: 12 },
            following: { type: 'integer', example: 8 },
            verified: { type: 'boolean', example: false },
            registerDate: { type: 'string', format: 'date-time' },
          },
        },
        Post: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '665f0d0eaebf7cc80d6fdb73' },
            user: { type: 'string', example: '665f0d0eaebf7cc80d6fdb72' },
            caption: { type: 'string', example: 'A day at the beach' },
            imageUrls: {
              type: 'array',
              items: { type: 'string', format: 'uri' },
            },
            likes: {
              type: 'array',
              items: { type: 'string' },
            },
            comments: {
              type: 'array',
              items: { type: 'object' },
            },
            date: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
      responses: {
        BadRequest: {
          description: 'Invalid request',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        Unauthorized: {
          description: 'Authentication is required or invalid',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        NotFound: {
          description: 'Requested resource was not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        InternalServerError: {
          description: 'Unexpected server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
  },
  apis: [path.join(__dirname, '../routes/*.{ts,js}')],
});

export default swaggerSpec;
