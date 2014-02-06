###Dependencies
* Redis server (v2.8.4+)
* Mysql (v5.5.32+)
* Mysql Workbench

###Setup
1. Checkout Typescript definitions from https://github.com/Infollion/DefinitelyTyped such that DefinitelyTyped and Coral are in same directories.
2. Checkout Docs from https://github.com/Infollion/SearchNTalk-Docs such that Docs and Coral are in same directories
3. Create symlink Docs\<env_name> -> /var/searchntalk/config
4. Create mysql database matching /var/searchntalk/config/config.json
5. Create mysql schema using Docs/sql/Schema.mwb and Mysql Workbench
