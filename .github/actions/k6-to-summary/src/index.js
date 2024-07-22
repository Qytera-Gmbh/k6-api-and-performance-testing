const core = require("@actions/core");
const fs = require("fs");
const xml2js = require("xml2js");

try {
    // Read inputs
    const filePath = core.getInput("k6-output-file");
    const fileBuffer = fs.readFileSync(filePath);

    // Parse XML
    const parser = new xml2js.Parser();
    parser.parseString(fileBuffer, (err, result) => {
        if (err) {
            throw new Error(`Failed to parse XML: ${err.message}`);
        }

        // Extract test suites
        const testsuites = result.testsuites.testsuite || [];
        let suiteErrorsFound = false;
        const allResults = [];

        testsuites.forEach((suite) => {
            const suiteResults = {};
            const testcases = suite.testcase || [];

            testcases.forEach((testcase) => {
                // Split classname into two parts
                const [groupName, testName] = testcase.$.classname.split("::").filter(Boolean);

                // Initialize the suite results array if not already
                if (!suiteResults[groupName]) {
                    suiteResults[groupName] = [];
                }

                // Check for failure
                const failure = testcase.failure ? testcase.failure.length > 0 : false;
                let message = testcase["system-out"] ? testcase["system-out"][0] : "";
                if (failure) {
                    suiteErrorsFound = true;
                    message = testcase.failure[0].$.message;
                }
                // Set status
                const status = failure ? "❌" : message.length > 1 ? "✅" : "";
                suiteResults[groupName].push([testName, testcase.$.name, message + " " + status]);
            });

            // Add suite results to the allResults
            Object.entries(suiteResults).forEach(([scenario, result]) => {
                allResults.push({
                    scenario,
                    results: result,
                });
            });
        });

        // Sort allResults first by number and then alphabetically by scenario
        allResults.sort((a, b) => {
            const aNumber = parseInt(a.scenario.match(/^#(\d+)/)[1]);
            const bNumber = parseInt(b.scenario.match(/^#(\d+)/)[1]);
            if (aNumber !== bNumber) {
                return aNumber - bNumber;
            }
            return a.scenario.localeCompare(b.scenario);
        });

        // Generate the summary
        let previousNumber = null;
        allResults.forEach(({ scenario, results }) => {
            const currentNumber = scenario.match(/^#(\d+)/)[1];
            if (previousNumber && previousNumber !== currentNumber) {
                core.summary.addRaw(`<hr>\n`);
            }
            previousNumber = currentNumber;

            // Determine the status for all tests under scenario
            const overallStatus = results.some(([, , status]) => status.includes("❌")) ? "❌" : "✅";

            core.summary.addRaw(`<details><summary>${scenario} - Status: ${overallStatus}</summary>\n`);

            // Add table with merged rows under the same group
            const mergedResults = results.reduce((acc, [group, test, status]) => {
                if (!acc[group]) {
                    acc[group] = [];
                }
                acc[group].push([test, status]);
                return acc;
            }, {});

            // Convert merged results to table rows
            const tableRows = [];
            Object.keys(mergedResults).forEach((group) => {
                mergedResults[group].forEach(([test, status], index) => {
                    tableRows.push([
                        index === 0 ? group : "", // Merge group cells
                        test,
                        status,
                    ]);
                });
            });

            core.summary.addTable([
                [
                    { data: "Gruppe", header: true },
                    { data: "Test", header: true },
                    { data: "Status", header: true },
                ],
                ...tableRows,
            ]);

            core.summary.addRaw(`</details>\n`);
        });

        // Write the summary
        core.summary.write();

        // Set action status based on errors found
        if (suiteErrorsFound) {
            core.setFailed("Errors found in the test results. See summary for details.");
        }
    });
} catch (error) {
    core.setFailed(error.message);
}
