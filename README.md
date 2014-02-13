###Dependencies
* Redis server (v2.8.4+)
* Mysql (v5.5.32+)
* Mysql Workbench

###Setup
1. Checkout Typescript definitions from https://github.com/Infollion/DefinitelyTyped such that DefinitelyTyped and Coral are in same directory (called ROOT now on).
2. Checkout Docs from https://github.com/Infollion/SearchNTalk-Docs such that Docs and Coral are in same directories
3. Create symlink Docs\<env_name> -> /var/searchntalk/config
4. Create mysql database matching /var/searchntalk/config/config.json
5. Create mysql schema using Docs/sql/Schema.mwb and Mysql Workbench

####Webstorm Settings
1. Create a new project in Webstorm with Location = ROOT

2. Modify File watcher > Typescript

    arguments                   = "--module commonjs  --sourcemap --declaration --removeComments  $FileName$"

    Working directory           = "$FileDir$"

    Output paths to refresh     = "$FileDir$"

3. Create Run configuration for Grunt

    Install grunt command line using `npm install -g grunt-cli`

    Working directory           = $path to Coral$

    Javascript file = $path to grunt-cli executable$

    _Mac: `which grunt` returns $path to grunt-cli executable$_

    _Windows:_

