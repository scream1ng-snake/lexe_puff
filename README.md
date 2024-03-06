## Описание

Сервер станции распознавния первичной документации. В будущем должен юзаться как микросервис Lexema 8.4.  
Пока тестовый варик выглядит так.  
<br/>

Клиентом является кроссплатформернное десктопное приложение на Путхоне.  
Узнать подробнее и глянуть репо <a href="#">тут</a>.

## Установка

```bash
$ npm install
```

## Конфигурация

Для конфигурирования сервера испольуется `config.yaml` файл в корне проекта.  
Побробнее на этом примере:
```yaml
mode: 'development'

http:
  host: 'localhost'
  port: 5001

db:
  application:
    type: 'postgres'
    host: 'localhost'
    port: 5432
    database: 'recognition-service'
    user: 'postgres'
    password: 'root'
    schema: 'public'
  
  lexema8: 
    type: 'postgres'
    host: 'localhost'
    port: 5432
    database: 'recognition-service'
    user: 'postgres'
    password: 'root'
    schema: 'public'

yandex:
  OAuth: "..."             # OAuth токен для авторизации приложений в сервисах Яндекс 
  XFolderId: "..."         # Идентификатор каталога в Яндекс облаке
```


## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```