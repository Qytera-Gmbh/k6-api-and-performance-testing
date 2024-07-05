/**
 * Converts K6 results (JSON files) to JUnit XML to better integrate with other tools.
 */
const fs = require("fs");
const path = require("path");
const junit = require("junit-report-builder");

// Directory containing JSON files
const reportsDir = path.join(__dirname, "../reports");

// Read all files in the reports directory
const jsonFiles = fs.readdirSync(reportsDir).filter((file) => file.endsWith(".json"));

// Process each JSON file
jsonFiles.forEach((fileName) => {
    const filePath = path.join(reportsDir, fileName);
    const data = fs.readFileSync(filePath, "utf8").split("\n").filter(Boolean).map(JSON.parse);
    const suiteName = fileName.replace(".json", "");
    const suite = junit.testSuite().name(suiteName);

    // Track the results of each test case
    const testResults = {};

    data.forEach((entry) => {
        if (entry.metric === "checks" && entry.type === "Point") {
            const checkName = entry.data.tags.check;
            const groupName = entry.data.tags.group || "default";
            const value = entry.data.value;
            const testCaseKey = `${groupName}.${checkName}`;

            // Initialize if not already present
            if (!testResults[testCaseKey]) {
                testResults[testCaseKey] = {
                    groupName,
                    checkName,
                    failedCount: 0,
                    totalCount: 0,
                };
            }

            // Update test case result
            testResults[testCaseKey].totalCount += 1;
            if (value === 0) {
                testResults[testCaseKey].failedCount += 1;
            }
        }
    });

    // Create JUnit test cases
    Object.values(testResults).forEach(({ groupName, checkName, failedCount, totalCount }) => {
        const testCase = suite.testCase().className(groupName).name(checkName).time(0);
        if (groupName.endsWith("::Fälle")) {
            testCase.standardOutput("-");
        } else {
            if (failedCount > 0) {
                testCase.failure(`${failedCount}/${totalCount}`);
            } else {
                testCase.standardOutput(`${totalCount}/${totalCount}`);
            }
        }
    });
});

junit.writeTo(path.join(reportsDir, "test-results.xml"));
console.log("JUnit report generated: test-results.xml");
