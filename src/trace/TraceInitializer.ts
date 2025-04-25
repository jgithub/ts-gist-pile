// export class TraceInitializer {
//   private static instance: TraceInitializer;

//   private constructor(serviceName: string) {
//     // Private constructor to prevent instantiation
//     console.log(`Initializing tracing for service: ${serviceName}`);
//     if (typeof window === 'undefined') {
//       // Node.js
//       const { NodeTracerProvider } = require('@opentelemetry/sdk-node');
//       const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
//       const { SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');
  
//       const provider = new NodeTracerProvider();
//       const exporter = new OTLPTraceExporter(); // customize endpoint as needed
//       provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
//       provider.register();
//     } else {
//       // Browser
//       const { WebTracerProvider } = require('@opentelemetry/sdk-trace-web');
//       const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
//       const { SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');
  
//       const provider = new WebTracerProvider();
//       const exporter = new OTLPTraceExporter(); // customize endpoint as needed
//       provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
//       provider.register();
//     }  
//   }

//   public static getInstance(serviceName: string): TraceInitializer {
//     if (!TraceInitializer.instance) {
//       TraceInitializer.instance = new TraceInitializer(serviceName);
//     }
//     return TraceInitializer.instance;
//   }
// }
