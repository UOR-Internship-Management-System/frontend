import type { RouteObject } from 'react-router-dom'
import { routePaths } from '../config/routePaths'
import { NotFoundPage } from './fallbacks/NotFoundPage'
import { UnauthorizedPage } from './fallbacks/UnauthorizedPage'

export const fallbackRoutes: RouteObject[] = [
  {
    path: routePaths.unauthorized,
    element: <UnauthorizedPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]
