// rules/require-api-query.mjs
module.exports = {
    meta: {
      type: 'problem',
      docs: {
        description:
          'Ensure methods with @Query() parameters have a matching @ApiQuery() decorator',
      },
      schema: [],
    },
    create(context) {
      const filename = context.getFilename();
      if (!filename.endsWith('.controller.ts')) {
        return {};
      }
  
      return {
        MethodDefinition(node) {
          // Only in classes decorated with @Controller
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
  
          // Detect if any parameter uses @Query()
          const fn = node.value;
          const hasQueryParam = fn.params.some((param) => {
            const decs = param.decorators || [];
            return decs.some((dec) => {
              const expr = dec.expression;
              return (
                expr.type === 'CallExpression' &&
                expr.callee.type === 'Identifier' &&
                expr.callee.name === 'Query'
              );
            });
          });
          if (!hasQueryParam) return;
  
          // Check for @ApiQuery() on the method itself
          const hasApiQuery = (node.decorators || []).some((dec) => {
            const expr = dec.expression;
            return (
              expr.type === 'CallExpression' &&
              expr.callee.type === 'Identifier' &&
              expr.callee.name === 'ApiQuery'
            );
          });
  
          if (!hasApiQuery) {
            context.report({
              node: node.key,
              message: `Method '${node.key.name}' uses @Query() but is missing an @ApiQuery() decorator.`,
            });
          }
        },
      };
    },
  };
  