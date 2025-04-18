// rules/require-api-property.mjs
export default {
    meta: {
        type: 'problem',
        docs: {
            description: 'Ensure all DTO properties have @ApiProperty() or @ApiPropertyOptional() decorator',
        },
        schema: [],
    },
    create(context) {
        return {
            ClassDeclaration(node) {
                if (!node.id?.name.endsWith('Dto')) return;

                for (const member of node.body.body) {
                    if (
                        member.type === 'PropertyDefinition' &&
                        member.key.type === 'Identifier'
                    ) {
                        const hasApiDecorator = (member.decorators || []).some((decorator) => {
                            const expr = decorator.expression;
                            return (
                                expr.type === 'CallExpression' &&
                                expr.callee.type === 'Identifier' &&
                                ['ApiProperty', 'ApiPropertyOptional'].includes(expr.callee.name)
                            );
                        });

                        if (!hasApiDecorator) {
                            context.report({
                                node: member.key,
                                message: `Property '${member.key.name}' is missing @ApiProperty() or @ApiPropertyOptional() decorator.`,
                            });
                        }
                    }
                }
            },
        };
    },
};
