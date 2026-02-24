import SwaggerParser from '@apidevtools/swagger-parser';
import { test, expect } from '@playwright/test';
import { petstoreConfig } from '../../config/petstore.config';

test('validate petstore swagger', async () => {
  const api = await SwaggerParser.validate(petstoreConfig.specPath as any);
  expect(api).toBeDefined();
});
