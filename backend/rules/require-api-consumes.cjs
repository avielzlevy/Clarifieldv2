// rules/require-api-consumes.mjs
module.exports =  {
  meta: {
    type: 'problem',
    docs: {
      description: 'Ensure every controller method has an @ApiConsumes() decorator',
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

          const hasConsumes = (member.decorators || []).some((dec) => {
            const expr = dec.expression;
            return (
              expr.type === 'CallExpression' &&
              expr.callee.type === 'Identifier' &&
              expr.callee.name === 'ApiConsumes'
            );
          });

          if (!hasConsumes) {
            context.report({
              node: member.key,
              message: `Method '${member.key.name}' is missing @ApiConsumes() decorator.`,
            });
          }
        }
      },
    };
  },
};
