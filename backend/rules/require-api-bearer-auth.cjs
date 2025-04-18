// rules/require-api-bearer-auth.mjs
module.exports =  {
    meta: {
      type: 'problem',
      docs: {
        description: 'Ensure protected controller methods (@UseGuards) have an @ApiBearerAuth() decorator',
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
          // Only in classes with @Controller
          const classNode = node.parent?.parent;
          if (
            !classNode ||
            classNode.type !== 'ClassDeclaration' ||
            !(classNode.decorators || []).some((dec) => {
              const expr = dec.expression;
              return expr.type === 'CallExpression' &&
                     expr.callee.type === 'Identifier' &&
                     expr.callee.name === 'Controller';
            })
          ) {
            return;
          }
  
          const decs = node.decorators || [];
          const hasUseGuards = decs.some((dec) => {
            const expr = dec.expression;
            return expr.type === 'CallExpression' &&
                   expr.callee.type === 'Identifier' &&
                   expr.callee.name === 'UseGuards';
          });
          if (!hasUseGuards) return;
  
          const hasBearer = decs.some((dec) => {
            const expr = dec.expression;
            return expr.type === 'CallExpression' &&
                   expr.callee.type === 'Identifier' &&
                   expr.callee.name === 'ApiBearerAuth';
          });
          if (!hasBearer) {
            context.report({
              node: node.key,
              message: `Protected method '${node.key.name}' is missing @ApiBearerAuth() decorator.`,
            });
          }
        },
      };
    },
  };
  