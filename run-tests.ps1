# Define an array of test files
$testFiles = @(
    "tests/controllers/authController.test.js",
    "tests/controllers/appointmentController.test.js",
    "tests/dbs",
    "tests/models"
    # "tests/controllers/authController.test.js",
    # "tests/controllers/providerController.test.js",
    # "tests/controllers/messageController.test.js"
)

# Loop through each test file
foreach ($file in $testFiles) {
    # Run the test for the current file
    Write-Output "Running test for file: $file"
    npx jest $file

    # Add a time delay (e.g., 1 second) before running the next test
    Start-Sleep -Seconds 1
}


