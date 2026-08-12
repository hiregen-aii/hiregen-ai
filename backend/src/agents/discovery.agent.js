function getString(value) {
    return typeof value === "string"
        ? value.trim()
        : "";
}

function pickFirstString(signal, fields) {
    for (const field of fields) {
        const value = getString(signal[field]);

        if (value) {
            return value;
        }
    }

    return "";
}

function guessHiringType(text) {
    const content = text.toLowerCase();

    if (content.includes("intern")) {
        return "INTERN";
    }

    if (
        content.includes("contract") ||
        content.includes("freelance") ||
        content.includes("temporary")
    ) {
        return "CONTRACT";
    }

    // NOTE: "PART_TIME" is NOT a valid value in the hiring_type Postgres
    // ENUM (INTERN, FULL_TIME, CONTRACT, BULK_HIRING, CAMPUS_DRIVE) — see
    // migrations/001_create_core_schema.sql. Inserting it would throw
    // "invalid input value for enum hiring_type". Mapping to CONTRACT for
    // now since part-time work is closer to contract than full-time.
    // If the business needs a real PART_TIME category, that requires a
    // migration to extend the enum — raise with Team 1 (Anuj) first.
    if (
        content.includes("part-time") ||
        content.includes("part time")
    ) {
        return "CONTRACT";
    }

    return "FULL_TIME";
}

async function runDiscoveryAgent(rawSignal) {

    if (!rawSignal || typeof rawSignal !== "object") {
        throw new Error("Invalid hiring signal payload.");
    }

    const company = pickFirstString(rawSignal, [
        "company",
        "companyName",
        "organization",
        "employer",
        "organizationName"
    ]);

    const role = pickFirstString(rawSignal, [
        "role",
        "title",
        "jobTitle",
        "position"
    ]);

    const description = pickFirstString(rawSignal, [
        "description",
        "jobDescription",
        "details",
        "summary"
    ]);

    const location = pickFirstString(rawSignal, [
        "location",
        "city",
        "jobLocation"
    ]);

    const source =
        pickFirstString(rawSignal, [
            "source",
            "platform",
            "provider"
        ]) || "Unknown";

    const sourceUrl = pickFirstString(rawSignal, [
        "sourceUrl",
        "url",
        "jobUrl",
        "link"
    ]);

    if (!company) {
        throw new Error("Company name is required.");
    }

    if (!role) {
        throw new Error("Job role is required.");
    }

    const hiringType = guessHiringType(
        `${role} ${description}`
    );

    return {
        company,
        role,
        hiringType,
        source,
        sourceUrl,
        description,
        location
    };
}

module.exports = {
    runDiscoveryAgent
};