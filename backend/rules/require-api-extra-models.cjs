// rules/require-api-extra-models.mjs
module.exports =  {
    meta: {
      type: 'problem',
      docs: {
        description:
          'Ensure controllers with methods returning generic DTO types have an @ApiExtraModels() decorator',
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
          // Only apply to classes decorated with @Controller
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
  
          // Check each method for a generic return type
          let needsExtraModels = false;
          for (const member of node.body.body) {
            if (
              member.type === 'MethodDefinition' &&
              member.value.returnType?.type === 'TSTypeAnnotation'
            ) {
              const tsType = member.value.returnType.typeAnnotation;
              if (
                tsType.type === 'TSTypeReference' &&
                tsType.typeParameters?.params.length > 0
              ) {
                needsExtraModels = true;
                break;
              }
            }
          }
          if (!needsExtraModels) return;
  
          // Verify @ApiExtraModels() is present on the class
          const hasExtraModels = decorators.some((dec) => {
            const expr = dec.expression;
            return (
              expr.type === 'CallExpression' &&
              expr.callee.type === 'Identifier' &&
              expr.callee.name === 'ApiExtraModels'
            );
          });
  
          if (!hasExtraModels) {
            context.report({
              node: node.id || node,
              message: `Controller '${node.id?.name || '<anonymous>'}' returns generic DTOs but is missing @ApiExtraModels() decorator.`,
            });
          }
        },
      };
    },
  };
  