var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', async function (req, res) {
  res.render('index.pug');
})
router.get('/spy', async function (req, res, next) {
  /**@type {import('../controller/record-manager')} */
  let recordManager = req.recordManager

  let variables = {
    title: `Bluestone Recording: ${recordManager.runtimeSetting.isRecording}`,
    groups: ui.operation.getSpyGroupsInfoForPug(),
    operations: ui.operation.getOperationInfoForPug(),
    argumentList: ui.operation.getArgumentsInfoForPug(),
    currentSelector: ui.operation.browserSelection.currentSelector,
    currentSelectorPic: ui.operation.getSpySelectorPictureForPug(),
    currentGroup: ui.operation.getCurrentGroupText(),
    currentOperation: ui.operation.getCurrentOperationText(),
    argumentsQueryKey: Operation.inbuiltQueryKey.currentArgument,
    argumentsQueryIndex: Operation.inbuiltQueryKey.currentArgumentIndex,
    btnAddStepValidation: ui.operation.spy.validation.btnAddStep,
    addStepQueryKey: Operation.inbuiltQueryKey.btnAddStep,
    cancelQueryKey: Operation.inbuiltQueryKey.btnCancel,
    runQueryKey: Operation.inbuiltQueryKey.btnRun,
    result: ui.operation.operationResult,
    txtSelector: Operation.inbuiltQueryKey.txtSelector,
    isRecording: ui.backend.isRecording,
    isRecordingQueryKey: Operation.inbuiltQueryKey.btnUpdateRecording,
    functionMuteStatus: ui.operation.getFunctionMuteState(),
    getFunctionMuteStatQueryKey: Operation.inbuiltQueryKey.btnMuteFuncQueryKey,
    isRecordingHtmlQueryKey: Operation.inbuiltQueryKey.btnIsRecordingHtml,
    isRecordingHtml: ui.backend.isCaptureHtml,
    returnList: ui.operation.getReturnInfoForPug(),
    returnQueryKey: Operation.inbuiltQueryKey.returnQueryKey,
    variableInfo: ui.operation.getVariableInfoForPug()
  }

  res.render('spy.pug', variables);
});
module.exports = router;
