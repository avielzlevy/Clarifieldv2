// rules/require-api-tags.mjs
module.exports =  {
    meta: {
        type: 'problem',
        docs: {
            description: 'Ensure every controller class has an @ApiTags() decorator',
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

                // Check for @ApiTags
                const hasApiTags = decorators.some((dec) => {
                    const expr = dec.expression;
                    return (
                        expr.type === 'CallExpression' &&
                        expr.callee.type === 'Identifier' &&
                        expr.callee.name === 'ApiTags'
                    );
                });

                if (!hasApiTags) {
                    context.report({
                        node: node.id || node,
                        message: `Controller '${node.id?.name || '<anonymous>'}' is missing @ApiTags() decorator.`,
                    });
                }
            },
        };
    },
};
