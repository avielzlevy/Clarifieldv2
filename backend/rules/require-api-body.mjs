// rules/require-api-body.mjs
export default {
    meta: {
      type: 'problem',
      docs: {
        description:
          'Ensure methods with @Body() parameters have a matching @ApiBody() decorator',
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
  
          // Detect if any parameter uses @Body()
          const fn = node.value;
          const hasBodyParam = fn.params.some((param) => {
            const decs = param.decorators || [];
            return decs.some((dec) => {
              const expr = dec.expression;
              return (
                expr.type === 'CallExpression' &&
                expr.callee.type === 'Identifier' &&
                expr.callee.name === 'Body'
              );
            });
          });
          if (!hasBodyParam) return;
  
          // Check for @ApiBody() on the method itself
          const hasApiBody = (node.decorators || []).some((dec) => {
            const expr = dec.expression;
            return (
              expr.type === 'CallExpression' &&
              expr.callee.type === 'Identifier' &&
              expr.callee.name === 'ApiBody'
            );
          });
  
          if (!hasApiBody) {
            context.report({
              node: node.key,
              message: `Method '${node.key.name}' uses @Body() but is missing an @ApiBody() decorator.`,
            });
          }
        },
      };
    },
  };
  