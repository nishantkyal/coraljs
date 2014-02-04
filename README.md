##Dependencies
* Redis server (v2.8.4+)
* Mysql (v5.5.32+)
* Mysql Workbench

***

##Setup
* Checkout Typescript definitions from https://github.com/Infollion/DefinitelyTyped such that DefinitelyTyped and Coral are in same directories.
* Checkout Docs from https://github.com/Infollion/SearchNTalk-Docs such that Docs and Coral are in same directories
* Create symlink Docs\<env_name> -> /var/searchntalk/config
* Create mysql database matching /var/searchntalk/config/config.json
* Create mysql schema using Docs/sql/Schema.mwb and Mysql Workbench
