import { anyApi, type ApiFromModules } from 'convex/server';
import type * as progress from '../../convex/progress';

// Same typed API shape as Convex codegen, without requiring a linked deployment
// to build the local course. Only the type import references server functions.
export const api = anyApi as unknown as ApiFromModules<{ progress: typeof progress }>;
