import { Given, When, Then } from '../bdd';
import { expect } from '@playwright/test';
import { APIRequestContext } from '@playwright/test';
import { petstoreConfig } from '../../config/petstore.config';
import SwaggerParser from '@apidevtools/swagger-parser';

let validatePet: ((data: any) => boolean) | null = null;
let petValidateErrors: any[] | null = null;

async function ensureValidators() {
  if (validatePet) return;
  const api: any = await SwaggerParser.dereference(petstoreConfig.specPath as any);
  const petSchema = api?.definitions?.Pet || api?.components?.schemas?.Pet;
  if (!petSchema) throw new Error('Pet schema not found in spec');
  const Ajv = (await import('ajv')).default;
  const ajv = new Ajv({ strict: false });
  validatePet = ajv.compile(petSchema);
}

Given('the Petstore Swagger is valid', async function () {
  await SwaggerParser.validate(petstoreConfig.specPath as any);
});

Given('I add a pet named {string}', async function (
  { request, world }: { request: APIRequestContext; world: any },
  name: string
) {
  const id = Date.now();
  const pet = {
    id,
    name,
    photoUrls: ['https://example.com/photo.jpg'],
    status: 'available',
  };

  const res = await request.post(`${petstoreConfig.baseUrl}/pet`, {
    data: JSON.stringify(pet),
    headers: { 'Content-Type': 'application/json' },
  });

  world.lastResponse = res;
  world.pet = pet;

  expect(res.ok()).toBeTruthy();
});

When('I get the pet by id', async function ({ request, world }: { request: APIRequestContext; world: any }) {
  const id = world?.pet?.id;
  if (!id) throw new Error('No pet id found on world (did you add a pet?)');
  const res = await request.get(`${petstoreConfig.baseUrl}/pet/${id}`);
  world.lastResponse = res;
  world.getPetBody = await res.json().catch(() => null);
});

Then('the pet name should be {string}', async function ({ world }: { world: any }, expectedName: string) {
  const body = world.getPetBody || (await world.lastResponse.json());
  expect(body).toBeTruthy();
  await ensureValidators();
  if (validatePet) {
    const valid = validatePet(body);
    if (!valid) {
      petValidateErrors = (validatePet as any).errors || null;
      throw new Error('Response body does not match Pet schema: ' + JSON.stringify(petValidateErrors));
    }
  }
  expect(body.name).toBe(expectedName);
});

When('I update the pet status to {string}', async function ({ request, world }: { request: APIRequestContext; world: any }, status: string) {
  const pet = { ...(world.pet || {}), status };
  if (!pet.id) throw new Error('No pet found on world to update');
  const res = await request.put(`${petstoreConfig.baseUrl}/pet`, {
    data: JSON.stringify(pet),
    headers: { 'Content-Type': 'application/json' },
  });
  world.lastResponse = res;
  world.pet = pet;
  expect(res.ok()).toBeTruthy();
});

Then('the pet status should be {string}', async function ({ world }: { world: any }, expectedStatus: string) {
  const body = world.getPetBody || (await world.lastResponse.json());
  expect(body).toBeTruthy();
  await ensureValidators();
  if (validatePet) {
    const valid = validatePet(body);
    if (!valid) {
      petValidateErrors = (validatePet as any).errors || null;
      throw new Error('Response body does not match Pet schema: ' + JSON.stringify(petValidateErrors));
    }
  }
  expect(body.status).toBe(expectedStatus);
});

When('I delete the pet by id', async function ({ request, world }: { request: APIRequestContext; world: any }) {
  const id = world?.pet?.id;
  if (!id) throw new Error('No pet id found on world (did you add a pet?)');
  const res = await request.delete(`${petstoreConfig.baseUrl}/pet/${id}`);
  world.lastResponse = res;
  expect(res.ok() || res.status() === 200).toBeTruthy();
});

Then('the pet should not be found by id', async function ({ request, world }: { request: APIRequestContext; world: any }) {
  const id = world?.pet?.id;
  if (!id) throw new Error('No pet id found on world (did you add a pet?)');
  const res = await request.get(`${petstoreConfig.baseUrl}/pet/${id}`);
  expect(res.status()).toBe(404);
});

