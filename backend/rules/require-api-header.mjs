// rules/require-api-header.mjs
export default {
    meta: {
      type: 'problem',
      docs: {
        description:
          'Ensure methods with @Headers() parameters have a matching @ApiHeader() decorator',
      },
      schema: [],
    },
    create(context) {
      const filename = context.getFilename();
      if (!filename.endsWith('.controller.ts')) return {};
  
      return {
        MethodDefinition(node) {
          // Only in @Controller classes
          const classNode = node.parent?.parent;
          if (
            !classNode ||
            classNode.type !== 'ClassDeclaration' ||
            !(classNode.decorators || []).some((dec) => {
              const expr = dec.expression;
              return (
                expr.type === 'CallExpression' &&
                expr.callee.type === 'Identifier' &&
                expr.callee.name === 'Controller'
              );
            })
          ) {
            return;
          }
  
          // Detect if any parameter uses @Headers()
          const hasHeadersParam = node.value.params.some((param) => {
            const decs = param.decorators || [];
            return decs.some((dec) => {
              const expr = dec.expression;
              return (
                expr.type === 'CallExpression' &&
                expr.callee.type === 'Identifier' &&
                expr.callee.name === 'Headers'
              );
            });
          });
          if (!hasHeadersParam) return;
  
          // Check for @ApiHeader() on the method itself
          const hasApiHeader = (node.decorators || []).some((dec) => {
            const expr = dec.expression;
            return (
              expr.type === 'CallExpression' &&
              expr.callee.type === 'Identifier' &&
              expr.callee.name === 'ApiHeader'
            );
          });
  
          if (!hasApiHeader) {
            context.report({
              node: node.key,
              message: `Method '${node.key.name}' uses @Headers() but is missing an @ApiHeader() decorator.`,
            });
          }
        },
      };
    },
  };
  