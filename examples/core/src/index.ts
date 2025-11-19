import {
  Toolkit,
  Group,
  Button,
  Label,
  Rect,
  SliderButton,
  Switch,
  Tabs,
  TextInput,
  Timeline,
} from '@arcanejs/toolkit';

const toolkit = new Toolkit({
  log: console,
});

toolkit.start({
  mode: 'automatic',
  port: 3000,
});

const root = new Group({
  direction: 'vertical',
});

toolkit.setRoot(root);

const tabs = root.appendChild(new Tabs());

// Slider Button

const sliderButtonTab = tabs.addTab('Slider Button', new Group());

const slider = sliderButtonTab.appendChild(
  new SliderButton({
    value: 0,
  }),
);

const sliderValue = sliderButtonTab.appendChild(
  new Label({ text: 'Slider Value: 0' }),
);

// Groups

const groupGroup = tabs.addTab(
  'Groups',
  new Group({
    title: 'Hello World',
    editableTitle: true,
  }),
);

const groupButton = groupGroup.addHeaderChild(
  new Button({
    text: 'Click me!',
    icon: 'play_arrow',
  }),
);

groupGroup.addListener('title-changed', groupGroup.setTitle);

const groupA = groupGroup.appendChild(
  new Group({
    title: 'Group A',
  }),
);

slider.addListener('change', (value) => {
  sliderValue.setText(`Slider Value: ${value}`);
});

const groupB = groupGroup.appendChild(
  new Group({
    title: 'Group B',
  }),
);

let s = 0;

const update = async () => {
  if (Math.random() < 0.5) {
    // Add delay
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  if (Math.random() < 0.5) {
    // Add error
    throw new Error('Random error occurred!');
  }
  switch (s) {
    case 0:
    case 2:
      groupA.setTitle('Group A ' + Math.random());
      break;
    case 1:
      groupGroup.removeChild(groupB);
      break;
    case 3:
      groupGroup.appendChild(groupB);
      break;
  }
  s = (s + 1) % 4;
};

groupButton.addListener('click', update);

// Rect

const rectGroup = tabs.addTab('Rect', new Group());

rectGroup.appendChild(new Rect({ color: 'rgba(255,0,0,0.5)' }));

// Switch

const switchGroup = tabs.addTab('Switch', new Group());

const sw = switchGroup.appendChild(new Switch({ defaultValue: 'on' }));

const swLabel = switchGroup.appendChild(new Label({ text: 'Switch is ON' }));

sw.addListener('change', (state) => {
  swLabel.setText(`Switch is ${state.toUpperCase()}`);
});

// Text Input

const textInputGroup = tabs.addTab('Text Input', new Group());

const textInput = textInputGroup.appendChild(
  new TextInput({
    value: 'Hello World',
  }),
);

const textInputLabel = textInputGroup.appendChild(
  new Label({ text: 'Text Input Value: Hello World' }),
);

textInput.addListener('change', (value) => {
  textInputLabel.setText(`Text Input Value: ${value}`);
});

// Timeline

const timelineGroup = tabs.addTab(
  'Timeline',
  new Group({
    direction: 'vertical',
  }),
);

const timelineButtons = timelineGroup.appendChild(new Group());

const timeline = new Timeline({
  state: {
    state: 'stopped',
    totalTimeMillis: 10000,
    currentTimeMillis: 0,
  },
  title: 'Timeline',
  subtitles: ['Subtitle 1', 'Subtitle 2'],
  source: {
    name: 'Source',
  },
});

const restartButton = timelineButtons.appendChild(
  new Button({
    text: 'Restart',
    icon: 'replay',
  }),
);

restartButton.addListener('click', () => {
  timeline.setProps({
    ...timeline.props,
    state: {
      state: 'stopped',
      totalTimeMillis: timeline.props.state.totalTimeMillis,
      currentTimeMillis: 0,
    },
  });
  playPauseButton.setIcon('play_arrow');
});

const playPauseButton = timelineButtons.appendChild(
  new Button({
    text: 'Play',
    icon: 'play_arrow',
  }),
);

playPauseButton.addListener('click', () => {
  const current = timeline.props.state;
  if (current.state === 'stopped') {
    timeline.setProps({
      ...timeline.props,
      state: {
        state: 'playing',
        effectiveStartTime: Date.now() - current.currentTimeMillis,
        speed: 1,
        totalTimeMillis: current.totalTimeMillis,
      },
    });
    playPauseButton.setIcon('pause');
  } else {
    timeline.setProps({
      ...timeline.props,
      state: {
        state: 'stopped',
        currentTimeMillis: Date.now() - current.effectiveStartTime,
        totalTimeMillis: current.totalTimeMillis,
      },
    });
    playPauseButton.setIcon('play_arrow');
  }
});

const addTimeButton = timelineButtons.appendChild(
  new Button({
    text: 'Add Time',
    icon: 'add',
  }),
);

addTimeButton.addListener('click', () => {
  const current = timeline.props.state;
  timeline.setProps({
    ...timeline.props,
    state: {
      ...current,
      totalTimeMillis: current.totalTimeMillis * 2,
    },
  });
});

const removeTimeButton = timelineButtons.appendChild(
  new Button({
    text: 'Remove Time',
    icon: 'remove',
  }),
);

removeTimeButton.addListener('click', () => {
  const current = timeline.props.state;
  timeline.setProps({
    ...timeline.props,
    state: {
      ...current,
      totalTimeMillis: current.totalTimeMillis / 2,
    },
  });
});

timelineGroup.appendChild(timeline);
