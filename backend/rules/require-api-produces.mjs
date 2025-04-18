// rules/require-api-produces.mjs
export default {
    meta: {
      type: 'problem',
      docs: {
        description: 'Ensure every controller method has an @ApiProduces() decorator',
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
          const decorators = node.decorators || [];
          const isController = decorators.some((dec) => {
            const expr = dec.expression;
            return (
              expr.type === 'CallExpression' &&
              expr.callee.type === 'Identifier' &&
              expr.callee.name === 'Controller'
            );
          });
          if (!isController) return;
  
          for (const member of node.body.body) {
            // only real methods (skip constructors, getters, setters, etc.)
            if (
              member.type !== 'MethodDefinition' ||
              member.kind !== 'method' ||
              member.key.type !== 'Identifier'
            ) {
              continue;
            }
  
            const hasProduces = (member.decorators || []).some((dec) => {
              const expr = dec.expression;
              return (
                expr.type === 'CallExpression' &&
                expr.callee.type === 'Identifier' &&
                expr.callee.name === 'ApiProduces'
              );
            });
  
            if (!hasProduces) {
              context.report({
                node: member.key,
                message: `Method '${member.key.name}' is missing @ApiProduces() decorator.`,
              });
            }
          }
        },
      };
    },
  };
  