#!/bin/bash

pushd "$(dirname "$0")" > /dev/null

# Determine the script to use
if command -v k6 >/dev/null 2>&1; then
    K6_CMD="k6"
elif [ -f "./k6.sh" ]; then
    K6_CMD="./k6.sh"
elif [ -f "./k6.exe" ]; then
    K6_CMD="./k6.exe"
else
    echo "Neither k6.sh, k6.exe, nor k6 found."
    exit 1
fi

# Create the reports directory
rm -rf reports
mkdir -p reports

# Variable to track test failures
TEST_FAILED=0

# Find and run the test scripts
for test_script in $(find api-tests/ -type f -name "*.test.js"); 
do 
    echo running test: "$test_script"
    K6_OUTPUT=$(mktemp)
    if ! sh -c '"$0" run --out json=reports/$(basename "$1" .js).json "$1"' "$K6_CMD" "$test_script" 2>&1 | tee "$K6_OUTPUT"; then
        TEST_FAILED=1
    fi
    if grep -q "level=error" "$K6_OUTPUT"; then
        TEST_FAILED=1
    fi
    rm "$K6_OUTPUT"
done

# Convert the JSON reports to JUnit format
pushd junit > /dev/null
npm ci --no-audit --no-fund

if ! node convert-json-to-junit.js; then
    echo "Failed to convert JSON reports to JUnit format."
    popd > /dev/null
    exit 1
fi

popd > /dev/null

# Exit with failure if any test failed
if [ $TEST_FAILED -ne 0 ]; then
    echo "Some tests failed."
    exit 1
fi

popd > /dev/null
