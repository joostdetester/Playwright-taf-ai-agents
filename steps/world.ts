export type World = {
  lastApiResponse?: any;
  createdPetId?: string | number;
  [key: string]: any;
};

export function createWorld(): World {
  return {};
}
