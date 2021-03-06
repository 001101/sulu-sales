<?php
/*
 * This file is part of the Sulu CMS.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */
namespace Sulu\Bundle\Sales\OrderBundle\DependencyInjection;

use Symfony\Component\Config\Definition\Builder\ArrayNodeDefinition;
use Symfony\Component\Config\Definition\Builder\TreeBuilder;
use Symfony\Component\Config\Definition\ConfigurationInterface;

class Configuration implements ConfigurationInterface
{
    /**
     * {@inheritDoc}
     */
    public function getConfigTreeBuilder()
    {
        $treeBuilder = new TreeBuilder();

        $root = $treeBuilder->root('sulu_sales_order');
        $root
            ->children()
                ->arrayNode('pdf_templates')
                    ->addDefaultsIfNotSet()
                    ->children()
                    ->scalarNode('base')
                        ->defaultValue('SuluSalesCoreBundle:Pdf:pdf-base.html.twig')
                    ->end()
                    ->scalarNode('header')
                        ->defaultValue('SuluSalesCoreBundle:Pdf:pdf-base-header.html.twig')
                    ->end()
                    ->scalarNode('footer')
                        ->defaultValue('SuluSalesCoreBundle:Pdf:pdf-base-footer.html.twig')
                    ->end()
                    ->scalarNode('macros')
                        ->defaultValue('SuluSalesCoreBundle:Pdf:pdf-macros.html.twig')
                    ->end()
                    ->scalarNode('confirmation')
                        ->defaultValue('SuluSalesOrderBundle:Pdf:order.confirmation.html.twig')
                    ->end()
                    ->scalarNode('dynamically')
                        ->defaultValue('SuluSalesOrderBundle:Pdf:order.dynamically.html.twig')
                    ->end()
                    ->scalarNode('dynamically_base')
                        ->defaultValue('SuluSalesOrderBundle:Pdf:order.confirmation.html.twig')
                    ->end()
                ->end()
            ->end()
            ->scalarNode('pdf_response_type')
                ->defaultValue('inline')
            ->end()
            ->scalarNode('pdf_order_confirmation_name_prefix')
                ->defaultValue('order_confirmation')
            ->end()
            ->scalarNode('pdf_order_dynamically_name_prefix')
                ->defaultValue('order_pdf')
            ->end()
            ->arrayNode('email_templates')
                ->addDefaultsIfNotSet()
                    ->children()
                    ->scalarNode('customer_confirmation')
                        ->defaultValue('SuluSalesOrderBundle:Email:customer.order.confirmation.twig')
                    ->end()
                    ->scalarNode('shopowner_confirmation')
                        ->defaultValue('SuluSalesOrderBundle:Email:shopowner.order.confirmation.twig')
                    ->end()
                    ->scalarNode('footer_txt')
                        ->defaultValue('')
                    ->end()
                    ->scalarNode('footer_html')
                        ->defaultValue('')
                    ->end()
                ->end()
            ->end()
            ->scalarNode('shop_email_from')->end()
            ->scalarNode('shop_email_confirmation_to')->end()
            ->scalarNode('send_email_confirmation_to_customer')
                ->defaultValue(true)
            ->end()
            ->scalarNode('send_email_confirmation_to_shopowner')
                ->defaultValue(true)
            ->end()
        ->end();

        $this->addObjectsSection($root);

        return $treeBuilder;
    }

    /**
     * Adds `objects` section.
     *
     * @param ArrayNodeDefinition $node
     */
    private function addObjectsSection(ArrayNodeDefinition $node)
    {
        $node
            ->children()
                ->arrayNode('objects')
                    ->addDefaultsIfNotSet()
                    ->children()
                        ->arrayNode('sales_order')
                            ->addDefaultsIfNotSet()
                            ->children()
                                ->scalarNode('model')
                                    ->defaultValue('Sulu\Bundle\Sales\OrderBundle\Entity\Order')
                                ->end()
                                ->scalarNode('repository')
                                    ->defaultValue('Sulu\Bundle\Sales\OrderBundle\Entity\OrderRepository')
                                ->end()
                            ->end()
                        ->end()
                    ->end()
                ->end()
            ->end();
    }
}
