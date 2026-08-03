const hiringSignalsRepository = require("../repositories/hiringSignals.repository");
const hiringRepo = require("../repositories/hiringSignals.repository");
const companyRepo = require("../repositories/companies.repository");
const AppError = require("../utils/AppError");
const allowedTransitions = {
    NEW: ["ENRICHING", "REJECTED"],
    ENRICHING: ["RESEARCHED", "REJECTED"],
    RESEARCHED: ["QUALIFIED", "REJECTED"],
    QUALIFIED: [],
    REJECTED: []
};

async function updateHiringSignalStatus(id, newStatus) {

    const signal =
        await hiringRepo.getHiringSignalById(id);

    if (!signal) {
        throw new AppError(
            "Hiring signal not found",
            404
        );
    }

    const allowed =
        allowedTransitions[signal.status];

    if (!allowed.includes(newStatus)) {
        throw new AppError(
            `Cannot change status from ${signal.status} to ${newStatus}`,
            400
        );
    }

    return await hiringRepo.updateHiringSignalStatus(
        id,
        newStatus
    );

}

async function createHiringSignal(data) {

    const {
        companyName,
        domain,
        industry,
        sizeRange,
        linkedinUrl,

        source,
        sourceUrl,
        roleTitle,
        hiringType,
        rawPayload = {}
    } = data;

    // Validation
    if (!companyName)
        throw new AppError("Company name is required", 400);

    if (!source)
        throw new AppError("Source is required", 400);

    if (!roleTitle)
        throw new AppError("Role title is required", 400);

    //--------------------------------------------------
    // Find company
    //--------------------------------------------------

    let company = await companyRepo.getCompanyByName(companyName);

    if (!company) {

        company = await companyRepo.createCompany(
            companyName,
            domain,
            industry,
            sizeRange,
            linkedinUrl
        );

    }

    //--------------------------------------------------
    // Generate dedupe key
    //--------------------------------------------------

    const dedupeKey =
        `${company.name}-${roleTitle}-${source}`
        .toLowerCase()
        .replace(/\s+/g, "-");

    //--------------------------------------------------
    // Duplicate check
    //--------------------------------------------------

    const duplicate =
        await hiringRepo.getHiringSignalByDedupeKey(dedupeKey);

    if (duplicate) {

        throw new AppError("Hiring signal already exists", 409);

    }

    //--------------------------------------------------
    // Save
    //--------------------------------------------------

    return await hiringRepo.createHiringSignal(

        company.id,

        source,

        sourceUrl,

        roleTitle,

        hiringType,

        rawPayload,

        dedupeKey,

        "NEW"

    );

}

async function getAllHiringSignals() {
    return await hiringSignalsRepository.getAllHiringSignals();
}

async function getHiringSignalById(id) {
    return await hiringSignalsRepository.getHiringSignalById(id);
}

// async function updateHiringSignalStatus(id, status) {
//     return await hiringSignalsRepository.updateHiringSignalStatus(id, status);
// }

async function deleteHiringSignal(id) {
    return await hiringSignalsRepository.deleteHiringSignal(id);
}

async function getHiringSignals(filters) {
    return await hiringRepo.getHiringSignals(filters);
}

async function getHiringSignalDetails(id) {

    const signal =
        await hiringRepo.getHiringSignalDetails(id);

    if (!signal) {
        throw new AppError(
            "Hiring signal not found",
            404
        );
    }

    return signal;

}



module.exports = {
    createHiringSignal,
    getAllHiringSignals,
    getHiringSignalById,
    updateHiringSignalStatus,
    deleteHiringSignal,
    getHiringSignals,
    getHiringSignalDetails,
};