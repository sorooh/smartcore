'use client'

export function MessageAnalyzer({ layers, confidence }) {
  return (
    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center justify-between mb-2">
        <h5 className="text-sm font-bold text-blue-800 flex items-center">
          <span className="mr-2">🧠</span>
          تحليل طبقات المخ
        </h5>
        <span className="text-xs bg-blue-200 text-blue-700 px-2 py-1 rounded-full">
          دقة: {confidence}%
        </span>
      </div>
      
      <div className="space-y-2">
        {layers.map((layer, index) => (
          <div key={index} className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="flex-shrink-0">
              <div className={`w-3 h-3 rounded-full ${
                layer.status === 'active' ? 'bg-green-400 animate-pulse' :
                layer.status === 'processing' ? 'bg-yellow-400 animate-bounce' :
                'bg-gray-300'
              }`}></div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-700">
                  {layer.icon} {layer.name}
                </span>
                <span className="text-xs text-blue-600">{layer.result}</span>
              </div>
              
              {layer.insights && (
                <div className="text-xs text-blue-600 mt-1">
                  {layer.insights.join(', ')}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-2 pt-2 border-t border-blue-200">
        <div className="text-xs text-blue-600">
          ⚡ المعالجة: {layers.filter(l => l.status === 'active').length} طبقة نشطة | 
          🎯 النتيجة: معالجة ذكية متكاملة
        </div>
      </div>
    </div>
  )
}