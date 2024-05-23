let _backgroundToMochaClient: BackgroundToMochaClient;

export function getBackgroundToMochaClient() {
  if (!_backgroundToMochaClient) {
    startBackgroundToMochaClient();
  }

  return _backgroundToMochaClient;
}

export function startBackgroundToMochaClient() {
  _backgroundToMochaClient = new BackgroundToMochaClient();
}

class BackgroundToMochaClient {
  private client: WebSocket;

  constructor() {
    if (!process.env.IN_TEST) {
      return;
    }

    this.client = new WebSocket('ws://localhost:8111');

    this.client.onopen = () => {
      console.log('WebSocket connection opened');
      this.send({ command: 'hello' });
    };

    this.client.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      console.log('Received message:', msg);

      if (msg.command === 'queryTabs') {
        chrome.tabs.query({ title: msg.title }, (tabs) => {
          console.log('Sending tabs:', tabs);
          this.send({ command: 'openTabs', tabs });
        });
      } else if (msg.command === 'switchToWindowWithTitle') {
        this.findIndexOfTabWithTitle(msg.title);
      }
    };

    this.client.onclose = () => {
      console.log('WebSocket connection closed');
    };

    this.client.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  findIndexOfTabWithTitle(title: string) {
    chrome.tabs.query({}, (tabs) => {
      console.log('Switching to tab:', tabs);

      const index = tabs.findIndex((tab) => tab.title === title);

      if (index === -1) {
        //recursively call this function in 500ms increments until the tab is found
        setTimeout(() => this.findIndexOfTabWithTitle(title), 500);
      } else {
        this.send({ command: 'openTabs', tabs });
        this.send({ command: 'switchToIndex', index: index });
      }
    });
  }

  send(message: any) {
    if (typeof message === 'string') {
      this.client.send(message);
    } else {
      this.client.send(JSON.stringify(message));
    }
  }

  switchToWindowWithTitle(title: string) {
    this.send({ command: 'switchedToTab', title });
  }
}
