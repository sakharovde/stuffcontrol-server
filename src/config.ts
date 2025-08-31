type NodeEnv = 'development' | 'test' | 'production';

const getNodeEnv = (): NodeEnv => {
  if(!process.env.NODE_ENV) {
    return 'development'
  }
  
  if(process.env.NODE_ENV === 'test') {
    return 'test';
  }

  if(process.env.NODE_ENV === 'production') {
    return 'production';
  }
  
  return 'development'
}

type Config = {
  db: {
    host?: string;
    port?: number;
    user?: string;
    password?: string;
    name?: string;
    logging?: boolean;
  }
};

const fullConfig: Record<NodeEnv, Config> = {
  development: {
    db: {
      host: 'localhost',
      port: 5432,
      user: 'stuffcontrol_user',
      password: 'stuffcontrol_password',
      name: 'stuffcontrol_development',
      logging: true,
    },
  },
  test: {
    db: {
      host: 'localhost',
      port: 5432,
      user: 'stuffcontrol_user',
      password: 'stuffcontrol_password',
      name: 'stuffcontrol_test',
      logging: false,
    },
  },
  production: {
    db: {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      name: process.env.DB_NAME,
      logging: true,
    },
  },
};

export const config = fullConfig[getNodeEnv()]
