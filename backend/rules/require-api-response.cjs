// rules/require-api-response.mjs
module.exports =  {
    meta: {
      type: 'problem',
      docs: {
        description: 'Ensure every controller method has at least one @ApiResponse() decorator',
      },
      schema: [],
    },
    create(context) {
      const filename = context.getFilename();
      if (!filename.endsWith('.controller.ts')) {
        return {};
      }
  
      return {
        ClassDeclaration(node) {
          // Only inspect @Controller classes
          const isController = (node.decorators || []).some((dec) => {
            const expr = dec.expression;
            return (
              expr.type === 'CallExpression' &&
              expr.callee.type === 'Identifier' &&
              expr.callee.name === 'Controller'
            );
          });
          if (!isController) return;
  
          for (const member of node.body.body) {
            if (
              member.type !== 'MethodDefinition' ||
              member.kind !== 'method' ||
              member.key.type !== 'Identifier'
            ) {
              continue;
            }
  
            const hasApiResponse = (member.decorators || []).some((dec) => {
              const expr = dec.expression;
              return (
                expr.type === 'CallExpression' &&
                expr.callee.type === 'Identifier' &&
                expr.callee.name === 'ApiResponse'
              );
            });
  
            if (!hasApiResponse) {
              context.report({
                node: member.key,
                message: `Method '${member.key.name}' is missing at least one @ApiResponse() decorator.`,
              });
            }
          }
        },
      };
    },
  };
  