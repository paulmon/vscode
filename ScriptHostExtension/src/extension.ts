'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import http = require('http');
var request = require('request');
import {IotDevice} from './iotDevice';



// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Windows Iot Core Extension for VS Code is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposableGetDeviceInfo = vscode.commands.registerCommand('extension.getDeviceInfo', () => {       
        let iotDevice = new IotDevice();
        var iotHost :string;
        var iotUser :string;
        var iotPassword: string;
        iotDevice.Init().then((b: boolean) => {
            return iotDevice.GetDeviceInfo();
        }).then( (info: any) => {
            iotDevice.PrintDeviceInfo(iotHost, info);
        })
    });
    context.subscriptions.push(disposableGetDeviceInfo);

    let disposableGetExtensionInfo = vscode.commands.registerCommand('extension.getExtensionInfo', () => {       
        let iotDevice = new IotDevice();
        iotDevice.GetExtensionInfo();
    });
    context.subscriptions.push(disposableGetExtensionInfo);

    let disposableGetPackages = vscode.commands.registerCommand('extension.getPackages', () => {       
        let iotDevice = new IotDevice();
        iotDevice.Init().then((b: boolean) => {
            return iotDevice.GetPackages();
        }).then( (info: any) => {
            iotDevice.PrintPackages(info);
        })       
    });
    context.subscriptions.push(disposableGetPackages);

    let disposableGetAppxProcessInfo = vscode.commands.registerCommand('extension.getAppxProcessInfo', () => {       
        let iotDevice = new IotDevice();
        iotDevice.Init().then((b: boolean) => {
            return iotDevice.GetProcessInfo();
        }).then( (info: any) => {
            iotDevice.PrintProcessInfo(info, true);
        })
        
    });

    context.subscriptions.push(disposableGetAppxProcessInfo);

    let disposableGetProcessInfo = vscode.commands.registerCommand('extension.getProcessInfo', () => {       
        let iotDevice = new IotDevice();
        iotDevice.Init().then((b: boolean) => {
            return iotDevice.GetProcessInfo();
        }).then( (info: any) => {
            iotDevice.PrintProcessInfo(info, false);
        })
        
    });
    context.subscriptions.push(disposableGetProcessInfo);

    let disposableListIotCommands =  vscode.commands.registerCommand('extension.listIotCommands', () => {
        let iotDevice = new IotDevice();
        iotDevice.ListIotCommands();
    });
    context.subscriptions.push(disposableListIotCommands);

    let disposableUploadFile = vscode.commands.registerCommand('extension.uploadFile', () => {       
        let iotDevice = new IotDevice();
        iotDevice.Init().then((b: boolean) => {
            iotDevice.UploadFile();
        });
    });
    context.subscriptions.push(disposableUploadFile);
    
    let disposableGetDeviceName = vscode.commands.registerCommand('extension.getDeviceName', () => {       
        let iotDevice = new IotDevice();
        iotDevice.GetDeviceName();
    });
    context.subscriptions.push(disposableGetDeviceName);

    let disposableSetDeviceName = vscode.commands.registerCommand('extension.setDeviceName', () => {
        let iotDevice = new IotDevice();
        iotDevice.SetDeviceName();
    });
    context.subscriptions.push(disposableSetDeviceName);

    let disposableRunCommand = vscode.commands.registerCommand('extension.runCommand', () => {
        let iotDevice = new IotDevice();
        iotDevice.RunCommandFromSettings();
    });
    context.subscriptions.push(disposableRunCommand);
    
    let disposableRunRemoteScript = vscode.commands.registerCommand('extension.runRemoteScript', () => {
        let iotDevice = new IotDevice();
        iotDevice.Init().then((b :boolean) => {
            iotDevice.RunRemoteScript();
        })
    });
    context.subscriptions.push(disposableRunRemoteScript);

    let disposableStartNodeScriptHostopApp = vscode.commands.registerCommand('extension.startNodeScriptHost', () => {
        let iotDevice = new IotDevice();
        iotDevice.Init().then((b: boolean) =>{
            iotDevice.StartNodeScriptHost();
        })
    });
    context.subscriptions.push(disposableStartNodeScriptHostopApp);

    let disposableStopNodeScriptHost = vscode.commands.registerCommand('extension.stopNodeScriptHost', () => {
        let iotDevice = new IotDevice();
        iotDevice.Init().then((b: boolean) => {
            iotDevice.StopNodeScriptHost();
        });
    });
    context.subscriptions.push(disposableStopNodeScriptHost);
}

// this method is called when your extension is deactivated
export function deactivate() {
}