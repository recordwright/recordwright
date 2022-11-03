# Architecture
* Playwright Control
* Regedit Control
* Project Generator Control
* Test List Control
* Step Control - Handle Step Information
  * Save all recording step from recorder
  * Save all output variables from steps
* Variable Control - Save all variable in the recording runtime coming from step evaluation
* Testcase Control
  * Testcase Generator
  * Testcase Parser
* Function Control
  * Function Parser (x)
  * Func Generator
  * Active Function Tracker
* Locator Control (x)
  * Locator Generator
  * Locator Parser/tracker
  * Active Locator Tracker
* Browser Meta Control - Save meta inforamtion from current recorded screen
  * Browser Selection
  * Record Html
  * Record Picture
  * Capture Screenshot?
* In-browser runner - run particular step or navigate browser to failed step
  * Function Control - Get Current Function to run
  * Step Control - Run all steps if needed, update step execution result
  * Variable Control - Save all existing variable
* Record Manager - Handle all recording-related operation
  * Function Control - set active function based on screen
  * Locator Control - provide locator to locator scanner. 
  * Browser Meta Control - Get current browser selection context
  * Step Control - Add step into current function
* Standalone Runner - Run current function and parse result and report back to step
  * Step Control - Update result for each step
* Locator Manager - Update locators and allow user to evaluate the impact by running list of test cases that is being affected by the change
* Test List Control
* Locator Control 

# Top Down Strcture
* In-browser Runner
* Standalone Runner
* Locator Manager