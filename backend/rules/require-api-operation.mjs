// rules/require-api-operation.mjs
export default {
    meta: {
        type: 'problem',
        docs: {
            description: 'Ensure every controller method has an @ApiOperation() decorator',
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
                // only apply inside @Controller classes
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
                    // only instance methods
                    if (
                        member.type !== 'MethodDefinition' ||
                        member.kind !== 'method' ||
                        member.key.type !== 'Identifier'
                    ) {
                        continue;
                    }

                    const hasApiOp = (member.decorators || []).some((dec) => {
                        const expr = dec.expression;
                        return (
                            expr.type === 'CallExpression' &&
                            expr.callee.type === 'Identifier' &&
                            expr.callee.name === 'ApiOperation'
                        );
                    });

                    if (!hasApiOp) {
                        context.report({
                            node: member.key,
                            message: `Method '${member.key.name}' is missing @ApiOperation() decorator.`,
                        });
                    }
                }
            },
        };
    },
};
