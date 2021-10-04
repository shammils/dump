
function trim(string, maxLength, prependThingy) {
  if (!string || !string.length) return string
  if (string.length < maxLength) return string
  else {
    if (prependThingy) return `${string.substring(0, maxLength-4)}...`
    else return string.substring(0, maxLength)
  }
}

renderBreadcrumbs()
function renderBreadcrumbs() {

  const stack = [
    {
      "type": "menu",
      "options": [
        {
          "name": "Manage Things",
          "type": "menu",
          "options": [
            {
              "name": "Thingoid #0",
              "type": "menu",
              "options": [
                {
                  "name": "thigoud Quit #0",
                  "type": "function"
                },
                {
                  "name": "thigoud Quit #1",
                  "type": "function"
                }
              ]
            },
            {
              "name": "Some Other Thing #1",
              "type": "menu",
              "options": [
                {
                  "name": "other Quit #0",
                  "type": "function"
                },
                {
                  "name": "other Quit #1",
                  "type": "function"
                }
              ]
            }
          ]
        },
        {
          "name": "Quit",
          "type": "function"
        }
      ]
    },
    {
      "name": "Manage Things",
      "type": "menu",
      "options": [
        {
          "name": "Thingoid #0",
          "type": "menu",
          "options": [
            {
              "name": "thigoud Quit #0",
              "type": "function"
            },
            {
              "name": "thigoud Quit #1",
              "type": "function"
            }
          ]
        },
        {
          "name": "Some Other Thing #1",
          "type": "menu",
          "options": [
            {
              "name": "other Quit #0",
              "type": "function"
            },
            {
              "name": "other Quit #1",
              "type": "function"
            }
          ]
        }
      ]
    },
    {
      "name": "Thingoid #0",
      "type": "menu",
      "options": [
        {
          "name": "thigoud Quit #0",
          "type": "function"
        },
        {
          "name": "thigoud Quit #1",
          "type": "function"
        }
      ]
    }
  ]

  if (stack.length > 1) {
    const crumbArr = []
    for (let i = 1; i < stack.length; i++) {
      crumbArr.push(trim(stack[i].name, 20, true))
    }
    console.log(crumbArr.join(' > '))
  }
}
