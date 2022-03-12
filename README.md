# DiscordMusicBot

Discord music bot using NodeJS, PostgreSQL and Docker

#

Must have **.env** file in the local dir of the project:

- token= _Paste your discord bot token_
- timezone= _Paste your timezone like Europe/Berlin_
- db_host=postgres
- db*username= \_Paste your username for the database*
- db*password= \_Paste your password for the database*
- db_database=musicBot
- delay=10

Use **sh run.sh** (linux only) to build and run the bot if you have installed Docker and Docker Compose\
After succssesful build invite the bot in your server and type **!help** or tag it like **@myBot**

Feel free to create issue if you find bug/s.
