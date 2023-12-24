<p align="center">
	<img src="https://github.com/maxencebonamy/maxencebonamy/blob/main/assets/Discord_Bot_Template.png" width="100%" alt="Discord Bot Template">
</p>

<br>

<p align="center">
	<img src="https://github.com/maxencebonamy/maxencebonamy/blob/main/assets/1_Description.png" width="100%" alt="Description">
</p>

This is a template for a Discord Bot using the following stack:
- Discord.js (with TypeScript)
- ESLint (using my own config)
- Cron (with Day.js)
- Zod
- Vitest

#### Credits

The auto-loader comes from [Royaume](https://github.com/Virtual-Royaume/Royaume-Discord-Bot).

<br>

<p align="center">
	<img src="https://github.com/maxencebonamy/maxencebonamy/blob/main/assets/2_Get_Started.png" width="100%" alt="Get Started">
</p>

### Install the template

> [!NOTE]
> *Prerequisites:*
> - [x] *Git must be installed on your computer. If not, <a href="https://git-scm.com/downloads" target="_blank">click here</a>.*
> - [x] *NodeJS must be installed on your computer, if not, <a href="https://nodejs.org/" target="_blank">click here</a>.*
<br>

1. **Clone** the repository on your computer. To do this, open a terminal in the folder of your choice and run the following command:
```
git clone https://github.com/maxencebonamy/Discord-Bot-Template
```

2. **Navigate** inside the folder you've just cloned with the following command:
```
cd Discord-Bot-Template
```

3. **Install** the dependencies of the template:
```
npm install
```

4. **Set** this environment variable in your .env file (you may need to create it):
```
BOT_TOKEN="your token"
```

5. **Run** the local development server:
```
npm run dev
```


<br>

<p align="center">
	<img src="https://github.com/maxencebonamy/maxencebonamy/blob/main/assets/3_Features.png" width="100%" alt="Features">
</p>

### Command generation

```
npm run create:command <name>
```
```
npm run create:subcommand <commandName> <name>
```

### Event generation

```
npm run create:event <name>
```

### Task generation

```
npm run create:task <name>
```

### Commands auto-loading

```
📂src/
├── 📂commands/
│   └── 📂command-name/
│       ├── 📄command-name.builder.ts
│       ├── 📄command-name.cmd.ts
│       ├── 📄command-name.util.ts
│       ├── 📄command-name.type.ts
│       └── 📂[sub-commands]/
│           ├── 📂group-example/
│           │   └── 📄sub-cmd-name.cmd.ts
│           └── 📄sub-cmd-name.cmd.ts
```

⚠ All commands files, sub-commands files, groups folders and sub-command-group files should have the same name as defined in your `command-name.builder.ts`


`command-name.builder.ts`: Builder of our command (detailled below)
| export         | type                     | required                     | description                                               |
| :------------- | :----------------------- | :--------------------------- | :-------------------------------------------------------- |
| `slashCommand` | `SlashCommandDefinition` | `true`                       | SlashCommandBuilder of our command                        |
| `guilds`       | `GuildsCommand`          | `false`                      | If this is defined, command will only be on these servers |
| `enableInDev`  | `EnableInDev`            | `false` *(default: `false`)* | If bot is launch in dev-mode, command will not be loaded  |


`command-name.cmd.ts`: Execution of our command (detailled below)
| export    | type             | required | description                                 |
| :-------- | :--------------- | :------- | :------------------------------------------ |
| `execute` | `CommandExecute` | `true`   | Will be executed when the command is called |

`command-name.util.ts`: All utilities functions our command need

`command-name.type.ts`: All types our command need

#### Sub commands

`SubCommands` are located in `[sub-commands]/` folder of our command

`group-exemple/sub-cmd-name.cmd.ts`: Execution of our sub-command group (detailled below)
| export    | type             | required | description                                           |
| :-------- | :--------------- | :------- | :---------------------------------------------------- |
| `execute` | `CommandExecute` | `true`   | Will be executed when the sub command group is called |

`sub-cmd-name.cmd.ts`: Execution of our sub-command (detailled below)
| export    | type             | required | description                                     |
| :-------- | :--------------- | :------- | :---------------------------------------------- |
| `execute` | `CommandExecute` | `true`   | Will be executed when the sub command is called |



### Events auto-loading

```
├── 📂events/
│   └── 📂event-name/
│       ├── 📄event-name.event.ts
│       ├── 📄event-name.util.ts
│       └── 📄event-name.type.ts
```

`event-name.event.ts`: Builder of our event (detailled below)
| export        | type           | required                     | description                                            |
| :------------ | :------------- | :--------------------------- | :----------------------------------------------------- |
| `event`       | `EventName`    | `true`                       | Name of our targeted event                             |
| `execute`     | `EventExecute` | `true`                       | Will be executed when our event will be called         |
| `enableInDev` | `EnableInDev`  | `false` *(default: `false`)* | If bot is launch in dev-mode, event will not be loaded |

`event-name.util.ts`: All utilities functions our event need

`event-name.type.ts`: All types our event need


### Tasks auto-loading

```
└── 📂tasks/
    └── 📂task-name/
        ├── 📄task-name.task.ts
        ├── 📄task-name.util.ts
        └── 📄task-name.type.ts
```

`task-name.task.ts`: Builder of our event (detailled below)

| export        | type           | required                     | description                                                                                  |
| :------------ | :------------- | :--------------------------- | :------------------------------------------------------------------------------------------- |
| `interval`    | `TaskInterval` | `true`                       | Interval of our task *(write in cron syntaxe: "* * * * * *" => "sec min hour d month week")* |
| `execute`     | `TaskExecute`  | `true`                       | Will be executed when our task will be on his interval                                       |
| `enableInDev` | `EnableInDev`  | `false` *(default: `false`)* | If bot is launch in dev-mode, task will not be loaded                                        |

`task-name.util.ts`: All utilities functions our task need

`task-name.type.ts`: All types our task need
