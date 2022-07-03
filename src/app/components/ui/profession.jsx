import React from "react";
import {
    getProfessionsByIds,
    getProfessionsLoadingStatus
} from "../../store/profession";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";

const Profession = ({ id }) => {
    const isLoading = useSelector(getProfessionsLoadingStatus());
    const prof = useSelector(getProfessionsByIds(id));

    if (!isLoading) {
        return <p>{prof.name}</p>;
    } else return "Loading...";
};
Profession.propTypes = {
    id: PropTypes.string
};
export default Profession;
