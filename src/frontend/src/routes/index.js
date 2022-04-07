import { memo } from 'react';
import { useRoutes } from 'react-router-dom';

// routes
import { useContext } from 'react';
import MainRoutes from './MainRoutes';
import AuthenticationRoutes from './AuthenticationRoutes';
import { UserContext } from 'context';
// ==============================|| ROUTING RENDER ||============================== //

const Routes = memo(() => {
    const { ip } = useContext(UserContext);
    const routes = ip ? MainRoutes() : AuthenticationRoutes();
    return useRoutes(routes, '');
});

export default Routes;
