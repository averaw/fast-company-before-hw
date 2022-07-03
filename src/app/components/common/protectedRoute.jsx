import React from "react";
import { Route, Redirect } from "react-router-dom";
import PropTypes from "prop-types";

import { useSelector } from "react-redux";
import { getIsLoggadIn } from "../../store/users";
function ProtectedRoute({ component: Component, children, ...rest }) {
    const isLoggadIn = useSelector(getIsLoggadIn());
    return (
        <Route
            {...rest}
            render={(props) => {
                if (!isLoggadIn) {
                    return (
                        <Redirect
                            to={{
                                pathname: "/login",
                                state: {
                                    from: props.location
                                }
                            }}
                        />
                    );
                }
                return Component ? <Component {...props} /> : children;
            }}
        />
    );
}
ProtectedRoute.propTypes = {
    component: PropTypes.func,
    location: PropTypes.object,
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node
    ])
};

export default ProtectedRoute;
