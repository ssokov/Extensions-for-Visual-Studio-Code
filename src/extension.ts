import * as vscode from 'vscode';

// Хранит начальное время
let start = Date.now();
let interval: NodeJS.Timeout | undefined;
let reminderInterval: NodeJS.Timeout | undefined;
let statusBarItem: vscode.StatusBarItem;


function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateStatusBar() {
  const elapsedTime = Math.floor((Date.now() - start) / 1000);
  statusBarItem.text = `Таймер: ${formatTime(elapsedTime)}`;
}

function showBreakReminder() {
  const panel = vscode.window.createWebviewPanel(
    'breakReminder',
    'Перерыв', 
    vscode.ViewColumn.Active, // Колонка редактора, в которой будет отображаться панель
    {
      enableScripts: true,
      retainContextWhenHidden: true,
    }
  );

  panel.webview.html = getWebviewContent();
}

function getWebviewContent() {
  return `<!DOCTYPE html>
  <html lang="ru">
  <head>
    <meta charset="UTF-8">
    <title>Напоминание о перерыве</title>
    <style>
      body {
        display: flex;
        height: 100vh;
        align-items: center;
        justify-content: center;
        font-size: 48px;
        background-color: #f0f0f0;
        margin: 0;
      }
    </style>
  </head>
  <body>
    <div>Сделайте перерыв!</div>
  </body>
  </html>`;
}

export function activate(context: vscode.ExtensionContext) {
  // Создаем элемент статусной строки
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  // Начинаем обновление статуса каждые 1 секунду
  updateStatusBar(); 
  interval = setInterval(updateStatusBar, 1000);

  // Запускаем таймер для напоминания о перерыве каждые 60 секунд
  reminderInterval = setInterval(showBreakReminder, 60000);

  context.subscriptions.push({
    dispose: () => {
      if (interval) {
        clearInterval(interval);
      }
      if (reminderInterval) {
        clearInterval(reminderInterval);
      }
      statusBarItem.dispose();
    },
  });

  const resetTimer = vscode.commands.registerCommand('worktimer.resetTimer', () => {
    start = Date.now();
    vscode.window.showInformationMessage('Таймер сброшен.');
  });

  context.subscriptions.push(resetTimer);
}

export function deactivate() {
  if (interval) {
    clearInterval(interval);
  }
  if (reminderInterval) {
    clearInterval(reminderInterval);
  }
  if (statusBarItem) {
    statusBarItem.dispose();
  }
}