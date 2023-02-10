import postgres from 'postgres'
import chalk from 'chalk'


export const pebble = postgres(process.env.PEBBLE_DB!, {
    max: process.env.NODE_ENV === "development" ? 5 : 10,
    idle_timeout: 10,
    connect_timeout: 30,
    debug:
      process.env.NODE_ENV === "development"
        ? function (connection, query, params, types) {
            // console.log(chalk.blue(JSON.stringify(params)))
            const newQuery = query.replace(/\$(\d+)/g, (match, p1) => {
              const replace = params[p1 - 1]
              if (typeof replace === "string") {
                return `'${replace}'`
              }
              return replace
            })
            console.log(chalk.green(newQuery))
          }
        : true,
    connection: {
      application_name: "iotexscan",
    },
  })