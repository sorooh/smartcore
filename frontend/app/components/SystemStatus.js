'use client'

export function SystemStatus({ status }) {
  const components = [
    { key: 'secretary', name: 'سُروح', icon: '🌸' },
    { key: 'brain', name: 'المخ', icon: '🧠' },
    { key: 'smartCore', name: 'المنسق', icon: '⚙️' },
    { key: 'bots', name: 'البوتات', icon: '🤖' }
  ]

  const allConnected = Object.values(status).every(Boolean)

  return (
    <div className="flex items-center space-x-4 rtl:space-x-reverse">
      <div className="flex items-center space-x-2 rtl:space-x-reverse">
        {components.map((component) => (
          <div
            key={component.key}
            className={`
              flex items-center space-x-1 rtl:space-x-reverse px-2 py-1 rounded-full text-xs
              ${status[component.key] 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-600'
              }
            `}
          >
            <span>{component.icon}</span>
            <span>{component.name}</span>
            <div className={`w-2 h-2 rounded-full ${
              status[component.key] ? 'bg-green-400' : 'bg-gray-400'
            }`}></div>
          </div>
        ))}
      </div>
      
      <div className={`
        flex items-center space-x-2 rtl:space-x-reverse px-3 py-2 rounded-full text-sm font-semibold
        ${allConnected 
          ? 'bg-green-100 text-green-800' 
          : 'bg-yellow-100 text-yellow-800'
        }
      `}>
        <div className={`w-3 h-3 rounded-full ${
          allConnected ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'
        }`}></div>
        <span>{allConnected ? 'متصل' : 'جاري الاتصال...'}</span>
      </div>
    </div>
  )
}