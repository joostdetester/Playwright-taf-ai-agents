export type World = {
  lastApiResponse?: any;
  createdPetId?: string | number;
  [key: string]: any;
  
  dbBooks?: {
    title?: string;
    name?: string;
    isbn?: string;
    aisle?: number;
    author?: string;
    published_year?: number;
  }[];

  apiBooks?: {
    book_name?: string;
    title?: string;
    isbn?: string;
    aisle?: string | number;
    author?: string;
  }[];
};

export function createWorld(): World {
  return {};
}

